// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// ! Event management API

import { Context, unthunk } from "../api";
import { logger } from "../logger";
import { SearchIndex } from "../search-index";
import { require_test } from "../test";

import * as group from "../api/group";
import * as location from "../api/location";
import * as rsvp from "../api/rsvp";
import * as user_api from "../api/user";
import * as db from "../database/event";
import * as group_db from "../database/group";
import * as rsvp_db from "../database/rsvp";
import * as error from "../error";

/// Lazily initialised event search index
let event_index: SearchIndex<string> = null;

export interface Event extends db.Event {
    can_edit: boolean;
    user_rsvp?: rsvp.RSVP;
    rsvps: rsvp.RSVP[];
    location: location.Location;
    remaining_capacity?: number;
}

interface CreateEvent {
    owner?: string;
    owned_by?: db.OwnedBy;
    event_info: Event;
}

interface UpdateEvent {
    eid: string;
    event_info: Event;
}

interface EventID {
    eid: string;
}

interface FilterEvent {
    filter: db.EventFilter;
    show_first?: db.Category[];
    show_never?: db.Category[];
}

interface SearchEvents {
    query: string;
}

 // EVENTS /////////////////////////////////////////////////

async function require_ownership(eid: string, context: Context) {
    const authenticated = context.require_user();
    const { owner, owned_by } = await db.event_owner(eid);

    if (owned_by === "USER") {
        if (owner !== authenticated.uid) {
            throw error.event_unauthorized(authenticated.uid, eid);
        }
    } else if (owned_by === "GROUP") {
        group.require_membership(owner, context);
    } else {
        throw error.event_unauthorized(authenticated.uid, eid);
    }
}

// Checks whether the current user can edit a given event
function can_edit(owner: string, context: Context): boolean {
    const authenticated = context.user;
    if (authenticated == null) {
        return false;
    }
    if (owner === authenticated.uid) {
        return true;
    } else {
        return false;
    }
}

// Inflate all fields in the event object
function unpack(e: db.Event, context: Context): Event {
    const result = e as Event;
    result.can_edit = can_edit(result.owner, context);
    if (e.location_id != null) {
        result.location = unthunk(() => location.fetch_location(result.location_id));
    }
    if (context.user != null) {
        result.user_rsvp = unthunk(() => rsvp.rsvp(e.eid, context.user.uid, context));
    }
    if (e.categories == null) {
        result.categories = [] as db.Category[];
    }
    result.rsvps = unthunk(() => rsvp.all_rsvps_event(result.eid, context));
    result.remaining_capacity = unthunk(() => rsvp_db.remaining_capacity(result.eid));
    return result;
}

// Find an event in the database
export async function fetch_event(
    eid: string,
    context: Context,
): Promise<(Event)> {
    // A user doesn't need to be logged in to view an event,
    // but they can't edit one
    const created = await db.event(eid);
    return unpack(created, context);
}

// Find an event in the database
export async function event(
    { eid }: EventID,
    context: Context,
): Promise<(Event)> {
    return fetch_event(eid, context);
}

// Search for event name
export async function search_events(
    {query}: SearchEvents,
    context: Context,
): Promise<Location[]> {
    const index = await lazy_index();
    const matches = index.search(query);

    const found = [];

    for (const match of matches) {
        found.push(await fetch_event(match, context));
    }

    return found;
}

// Create a new event with currect user as owner
export async function create_event(
    { event_info }: CreateEvent,
    context: Context,
): Promise<Event> {
    // User only has permission to create event if logged in
    // Authenticated user becomes event owner
    const authenticated = context.require_user();
    event_info.owner = authenticated.uid;
    event_info.owned_by = "USER";
    const result = await db.create_event(event_info);
    const extended = unpack(result, context);
    await index_event(await lazy_index(), extended);
    return extended;
}

// Create a new event with currect user as owner
export async function create_group_event(
    { owner, event_info }: CreateEvent,
    context: Context,
): Promise<Event> {
    // User only has permission to create event if logged in
    // Authenticated user becomes event owner
    group.require_membership(owner, context);
    event_info.owner = owner;
    event_info.owned_by = "GROUP";
    const result = await db.create_event(event_info);
    const extended = unpack(result, context);
    await index_event(await lazy_index(), extended);
    invite_group_to_event(extended.eid, owner);
    return extended;
}

export async function create_event_with_owner(
    { owner, owned_by, event_info }: CreateEvent,
    context: Context,
): Promise<Event> {
    require_test();
    event_info.owner = owner;
    event_info.owned_by = owned_by;
    const result = await db.create_event(event_info);
    const extended = unpack(result, context);
    await index_event(await lazy_index(), extended);

    if (owned_by === "GROUP") {
        invite_group_to_event(extended.eid, owner);
    }

    return extended;
}

// Invite all members and subscribers to a group event
async function invite_group_to_event(
    event_id: string,
    group_id: string,
) {
    for (const member of await group_db.all_members(group_id)) {
        await rsvp_db.create_invite(event_id, member);
    }
    for (const subscriber of await group_db.all_subscribers(group_id)) {
        await rsvp_db.create_invite(event_id, subscriber);
    }
}

// Update the details of event with given ID
export async function update_event(
    { eid, event_info }: UpdateEvent,
    context: Context,
): Promise<Event> {
    await require_ownership(eid, context);
    const result = await db.update_event(eid, event_info);
    const extended = unpack(result, context);
    if (event_info.name) {
        await index_event(await lazy_index(), extended);
    }
    return extended;
}

// Update the details of event with given ID and owner
export async function update_event_without_owner(
    { eid, event_info }: UpdateEvent,
    context: Context,
): Promise<Event> {
    require_test();
    const result = await db.update_event(eid, event_info);
    const extended = unpack(result, context);
    if (event_info.name) {
        await index_event(await lazy_index(), extended);
    }
    return extended;
}

// Delete an event
export async function delete_event(
    { eid }: EventID,
    context: Context,
): Promise<boolean> {
    await require_ownership(eid, context);
    await db.delete_event(eid);
    await delete_index(await lazy_index(), eid);
    return true;
}

// Delete an event given an owner
export async function delete_event_without_owner(
    { eid }: EventID,
): Promise<boolean> {
    require_test();
    await db.delete_event(eid);
    await delete_index(await lazy_index(), eid);
    return true;
}

// Fetch all events
export async function all_events(context: Context): Promise<Event[]> {
    require_test();
    const result = await db.all_events() as Event[];
    for (const e of result) {
        unpack(e, context);
    }
    return result;
}

// Fetch all publically listed events matching supplied filters
export async function all_public_events(
    { filter }: FilterEvent,
    context: Context,
): Promise<Event[]> {
    const events = await db.all_public_events(filter) as Event[];
    for (const e of events) {
        unpack(e, context);
    }
    let result: Event[];
    if (context.user != null) {
        const u = await user_api.user(context.user.uid, context);
        result = recommend_events(u.show_first, u.show_never, events);
    } else {
        result = events;
    }
    return result;
}

// Fetch all publically listed events matching supplied filters
// Given preferences for ordering
export async function all_public_events_with_prefs(
    { filter, show_first, show_never }: FilterEvent,
): Promise<Event[]> {
    require_test();
    const events = await db.all_public_events(filter) as Event[];
    // Can't call unpack without logged in user
    // Just ensure categories are defined
    for (const e of events) {
        if (e.categories == null) {
            e.categories = [] as db.Category[];
        }
    }
    const result = recommend_events(show_first, show_never, events);

    return result;
}

// Given a list of events, sort into a recommendation matching
// given preferences
function recommend_events(
    show_first: db.Category[],
    show_never: db.Category[],
    events: Event[],
): Event[] {
    // Filter out "show never" results
    const keep = remove_show_never(show_never, events);
    // Order remaining events by number of matches
    const result = order_by_interests(show_first, keep);
    return result;
}

// Remove results that the given user has asked not to see
function remove_show_never(
    show_never: db.Category[],
    events: Event[],
): Event[] {
    if (show_never.length === 0) {
        return events;
    }
    const keep = [] as Event[];
    let excluded = false;
    let j = 0;
    for (const e of events) {
        for (const n of show_never) {
            while (j < e.categories.length) {
                if (n === e.categories[j]) {
                    excluded = true;
                    break;
                }
                j += 1;
            }
            if (excluded) {
                break;
            }
            j = 0;
        }
        if (!excluded) {
            keep.push(e);
        }
        excluded = false;
    }
    return keep;
}

function order_by_interests(
    show_first: db.Category[],
    events: Event[],
): Event[] {
    // Order by the "show first" results
    if (show_first.length === 0) {
        return events;
    }
    // Initialise all counts to 0
    const counts = [];
    for (const e of events) {
        counts.push([e, 0]);
    }
    // Count matches
    let i = 0;
    let j = 0;
    for (const e of events) {
        for (const f of show_first) {
            while (j < e.categories.length) {
                if (f === e.categories[j]) {
                    counts[i][1] += 1;
                }
                j += 1;
            }
            j = 0;
        }
        i += 1;
    }
    // Order by matches
    const sorted = counts.sort((n1, n2) => {
        return n2[1] - n1[1];
    });

    // Add to result list in correct order
    const result = [] as Event[];
    for (const e of sorted) {
        result.push(e[0]);
    }

    return result;
}

// Fetch all events owned or attended by given user
export async function all_events_user(
    uid: string,
    context: Context,
): Promise<Event[]> {
    const result = await db.all_events_user(uid) as Event[];
    for (const e of result) {
        unpack(e, context);
    }
    return result;
}

// All events owned by given user
export async function all_owned_events(context: Context): Promise<Event[]> {
    const authenticated = context.require_user();
    const owner = {
        owner: authenticated.uid,
        owned_by: "USER" as db.OwnedBy,
    };
    const result = await db.all_owned_events(owner) as Event[];
    for (const e of result) {
        unpack(e, context);
    }
    return result;
}

// All events owned by given group
export async function all_group_events(
    gid: string,
    context: Context,
): Promise<Event[]> {
    const owner = {
        owner: gid,
        owned_by: "GROUP" as db.OwnedBy,
    };
    const result = await db.all_owned_events(owner) as Event[];
    for (const e of result) {
        unpack(e, context);
    }
    return result;
}

// Search indexing functionality ///////////////////////
// Create or fetch search index
async function lazy_index(): Promise<SearchIndex<string>> {
    if (event_index === null) {
        event_index = await create_index();
    }

    return event_index;
}

// Create a new index for events
async function create_index(): Promise<SearchIndex<string>> {
    logger.log({
        level: "info",
        message: "Creating event search index",
    });

    /// Create a new search index
    const index: SearchIndex<string> = new SearchIndex();

    /// Add all the locations to the index
    const db_events = await db.unfiltered_public_events();
    for (const e of db_events) {
        await index_event(index, e as Event);
    }

    logger.log({
        level: "info",
        message: "Event search index created",
    });

    return index;
}

// Index an event by name
async function index_event(
    index: SearchIndex<string>,
    e: Event,
) {
    // Invalidate all previous matches
    index.invalidate(e.eid);

    // Re-insert into index only if event is public
    if (e.public_event) {
        logger.log({
            level: "info",
            message: `Adding ${e.eid}: ${e.name}`,
        });
        index.insert(e.name, e.eid);
    }
}

// Invalidate all matches for a specific event id
async function delete_index(
    index: SearchIndex<string>,
    eid: string,
) {
    index.invalidate(eid);
}
