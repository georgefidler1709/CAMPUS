// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// Event operations and datatypes within the database

import {DocumentReference} from "@google-cloud/firestore";
import { delete_all, firestore } from "../database";
import * as error from "../error";
import {logger} from "../logger";
import { require_test } from "../test";

export interface Event extends Owner {
    name: string;
    start_time: string;
    end_time: string;
    eid?: string;
    description?: string;
    location_id?: string;
    public_event?: boolean;
    capacity?: number;
    categories: Category[];
}

export type Category = (
    "ADVICE" |
    "ARTS" |
    "BIOLOGY" |
    "BUSINESS" |
    "CHEMISTRY" |
    "COMPUTER_SCIENCE" |
    "CONCERT" |
    "ECONOMICS" |
    "FINE_ART" |
    "FREE_FOOD" |
    "GIVEAWAY" |
    "HISTORY" |
    "LANGUAGES" |
    "LAW" |
    "LECTURE" |
    "LITERATURE" |
    "MATHS" |
    "MEDICINE" |
    "MEETING" |
    "MUSIC" |
    "PERFORMANCE" |
    "PHILOSOPHY" |
    "PHYSICS" |
    "POLITICS" |
    "PSYCHOLOGY" |
    "REHEARSAL" |
    "SCIENCE" |
    "SEMINAR" |
    "SOCIAL" |
    "TALK" |
    "THEATRE" |
    "TUTORIAL"
);

export interface Owner {
    owner: string;
    owned_by?: OwnedBy;
}

export type OwnedBy = ("USER" | "GROUP");

export interface EventFilter {
    happening_now: boolean;
    location?: string;
    categories: Category[];
}

// Find an event in the database
export async function event(eid: string): Promise<(Event | null)> {
    logger.log({
        level: "info",
        message: `Requesting event with EID ${eid}`,
    });

    const doc = await firestore.collection("events").doc(eid).get();

    if (doc.exists) {
        const result = doc.data() as Event;
        result.eid = eid;
        return result;
    } else {
        logger.log({
            level: "info",
            message: `Not found: Event with EID ${eid}`,
        });
        return null;
    }
}

export async function event_owner(eid: string): Promise<Owner> {
    logger.log({
        level: "info",
        message: `Requesting owner for event with EID ${eid}`,
    });
    const doc = await firestore.collection("events").doc(eid).get();

    if (!doc.exists) {
        throw error.event_not_found(eid);
    }

    return doc.data() as Owner;
}

// Create an event in the database
export async function create_event(
    new_event: Event,
): Promise<Event> {
    logger.log({
        level: "info",
        message: `Creating event: ${new_event.name}`,
    });
    let created: DocumentReference;
    created = await firestore.collection("events").add(new_event);
    const doc = await created.get();

    const data = doc.data() as Event;
    data.eid = doc.id;
    return data;
}

// Update an event in the database
export async function update_event(
    eid: string,
    updated: Event,
): Promise<Event> {
    logger.log({
        level: "info",
        message: `Updating event: ${updated.name} with EID ${eid}`,
    });
    // Try to fetch event from database
    const doc = await firestore.collection("events").doc(eid).get();

    // Only create a new event if one doesn't exist, otherwise set the
    // name.
    if (doc.exists) {
        await doc.ref.update(updated);
    } else {
        throw error.event_not_found(eid);
    }

    // Return the event
    return event(eid);
}

// Delete an event from the database
export async function delete_event(eid: string) {
    logger.log({
        level: "info",
        message: `Deleting event with EID ${eid}`,
    });

    const doc = firestore.collection("events").doc(eid);
    await delete_all(doc.collection("rsvps"));
    await doc.delete();
}

// Find all public events in the database
export async function all_public_events(
    filter: EventFilter,
): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the events`,
    });

    const now = new Date().toISOString();

    let query = firestore
            .collection("events")
            .where("public_event", "==", true)
            .where("end_time", ">", now);

    if (filter.location != null) {
        query = query.where("location_id", "==", filter.location);
    }
    if (filter.categories.length !== 0) {
        query = query.where("categories", "array-contains-any", filter.categories);
    }

    const query_results = await query.get();
    const events = query_results.docs.map((doc) => {
        const data = doc.data() as Event;
        data.eid = doc.id;
        return data;
    });

    // Apply additional filters
    const result = [] as Event[];
    for (const e of events) {
        if (filter.happening_now && e.start_time > now) {
            continue;
        }
        result.push(e);
    }

    return result;
}

export async function unfiltered_public_events(): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the public events`,
    });

    const query_results = await firestore
            .collection("events")
            .where("public_event", "==", true)
            .get();

    return query_results.docs.map((doc) => {
        const data = doc.data() as Event;
        data.eid = doc.id;
        return data;
    });
}

// Return all events responded to or owned by a specified user
export async function all_events_user(owner: string): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the events for user: ${owner}`,
    });
    const owned = await all_owned_events({ owner, owned_by: "USER" });
    const invited = await all_invited_events(owner);

    const result = [] as Event[];

    for (const e of owned) {
        result.push(e);
    }
    for (const e of invited) {
        result.push(e);
    }
    return result;
}

// Return all events owned by a specified user
export async function all_owned_events(
    { owner, owned_by }: Owner,
): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the owned events for ${owned_by}: ${owner}`,
    });
    const query = await firestore
            .collection("events")
            .where("owner", "==", owner)
            .where("owned_by", "==", owned_by)
            .get();
    const result = query.docs.map((doc) => {
        const data = doc.data() as Event;
        data.eid = doc.id;
        return data;
    });
    return result;
}

// Return all events responded to by a specified user
export async function all_invited_events(uid: string): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the invited events for user: ${uid}`,
    });
    const invited = await firestore
            .collectionGroup("rsvps")
            .where("guest_id", "==", uid)
            .where("response", "in", ["INVITED", "ATTENDING"])
            .get();
    const result = []  as Event[];
    for (const doc of invited.docs) {
        const n = await event(doc.ref.parent.parent.id);
        if (uid !== n.owner) {
            result.push(n);
        }
    }
    return result;
}

// Find all events in the database
export async function all_events(): Promise<Event[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the events`,
    });
    // This should only work in a testing environment
    require_test();
    const query = await firestore.collection("events").get();
    const events = query.docs.map((doc) => {
        const data = doc.data() as Event;
        data.eid = doc.id;
        return data;
    });
    return events;
}
