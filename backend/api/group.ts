// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// ! Group management API

import {Context, unthunk} from "../api";
import {all_events_user, Event} from "../api/event";
import * as db from "../database/group";
import { logger } from "../logger";
import { SearchIndex } from "../search-index";
import { require_test, require_test_or } from "../test";
import * as event_api from "./event";
import * as user_api from "./user";

/// Lazily initialised location search index
let group_index: SearchIndex<string> = null;

// API group object
export interface Group extends db.Group {
    members: user_api.User[];
    subscribers: user_api.User[];
    calendar: event_api.Event[];
}

interface ViewGroup {
    gid: string;
}

interface SearchGroups {
    query: string;
}

interface SearchPublicGroups {
    query: string;
}

interface CreateGroup {
    group: db.Group;
}

interface CreateGroupForUser {
    user: string;
    group: db.Group;
}

interface UpdateGroup {
    gid: string;
    group: db.Group;
}

interface AddGroupMember {
    gid: string;
    user: string;
}

interface RemoveGroupMember {
    gid: string;
    user: string;
}

interface SubscribeToGroup {
    gid: string;
}

interface UnsubscribeFromGroup {
    gid: string;
}

interface SubscribeUserToGroup {
    gid: string;
    user: string;
}

interface UnsubscribeUserFromGroup {
    gid: string;
    user: string;
}

interface DeleteGroup {
    gid: string;
}

// Get a single group by ID
export async function view_group(
    { gid }: ViewGroup,
    context: Context,
): Promise<Group> {
    let uid = null;
    if (context.user != null) {
        uid = context.user.uid;
    }

    return unpack(await db.group_with_viewer(gid, uid), context);
}

// All publically listed groups
export async function public_groups(
    {}: {},
    context: Context,
): Promise<Group[]> {
    const groups = await db.all_public_groups();
    return groups.map((group) => unpack(group, context));
}

// Search groups
export async function search_public_groups(
    { query }: SearchPublicGroups,
    context: Context,
): Promise<Group[]> {
    const index = await lazy_index();
    const matches = index.search(query);
    const groups = await Promise.all(matches.map(db.group));
    return await Promise.all(groups.map((g) => unpack(g, context)));
}

// Create a new group with the current user as the only member
export async function create_group(
    { group }: CreateGroup,
    context: Context,
): Promise<Group> {
    const authenticated = context.require_user();

    const created = await db.create_group(group);
    const unpacked = unpack(
        await db.add_member(created.gid, authenticated.uid),
        context,
    );

    index_group(await lazy_index(), unpacked);

    return unpacked;
}

// Create a group with a specific user as the first member
export async function create_group_for_user(
    { user, group }: CreateGroupForUser,
    context: Context,
): Promise<Group> {
    require_test();

    const created = await db.create_group(group);
    const unpacked = unpack(
        await db.add_member(created.gid, user),
        context,
    );

    index_group(await lazy_index(), unpacked);

    return unpacked;
}

// Update the basic details of a group
export async function update_group(
    { gid, group }: UpdateGroup,
    context: Context,
): Promise<Group> {
    await require_test_or(() => require_membership(gid, context));
    const updated = unpack(
        await db.update_group(gid, group),
        context,
    );

    index_group(await lazy_index(), updated);

    return updated;
}

// Add a member to a group
export async function add_group_member(
    { gid, user }: AddGroupMember,
    context: Context,
): Promise<Group> {
    await require_test_or(() => require_membership(gid, context));
    return unpack(await db.add_member(gid, user), context);
}

// Remove a user from a group
export async function remove_group_member(
    { gid, user }: RemoveGroupMember,
    context: Context,
): Promise<Group> {
    await require_test_or(() => require_membership(gid, context));
    return unpack(await db.remove_member(gid, user), context);
}

// Subscribe to a group to view events
export async function subscribe_to_group(
    { gid }: SubscribeToGroup,
    context: Context,
): Promise<Group> {
    await require_public(gid);
    const authenticated = context.require_user();
    return unpack(
        await db.add_subscriber(gid, authenticated.uid),
        context,
    );
}

// Unsubscribe from a group to stop receiving event invites
export async function unsubscribe_from_group(
    { gid }: UnsubscribeFromGroup,
    context: Context,
): Promise<Group> {
    await require_subscribership(gid, context);
    const authenticated = context.require_user();
    return unpack(
        await db.remove_subscriber(gid, authenticated.uid),
        context,
    );
}

// Subscribe a particular user to a group
export async function subscribe_user_to_group(
    { gid, user }: SubscribeUserToGroup,
    context: Context,
): Promise<Group> {
    await require_test_or(() => require_membership(gid, context));
    return unpack(await db.add_subscriber(gid, user), context);
}

// Unsubscribe a particular user from a group
export async function unsubscribe_user_from_group(
    { gid, user }: UnsubscribeUserFromGroup,
    context: Context,
): Promise<Group> {
    await require_test_or(() => require_membership(gid, context));
    return unpack(await db.remove_subscriber(gid, user), context);
}

// Delete a group entirely
export async function delete_group(
    { gid }: DeleteGroup,
    context: Context,
): Promise<boolean> {
    await require_test_or(() => require_membership(gid, context));

    await db.delete_group(gid);

    const index = await lazy_index();
    index.invalidate(gid);

    return true;
}

// Get all of the groups of which given user is a member
export async function with_member(
    user: string,
    context: Context,
): Promise<Group[]> {
    const groups = await db.all_groups_with_member(user);
    const mapped = groups.map((group) => unpack(group, context));
    return await Promise.all(mapped);
}

export async function with_subscriber(
    user: string,
    context: Context,
): Promise<Group[]> {
    const groups = await db.all_groups_with_subscriber(user);
    const mapped = groups.map((group) => unpack(group, context));
    return await Promise.all(mapped);
}

// Inflate all fields in the group object
function unpack(db_group: db.Group, context: Context): Group {
    const result = db_group as Group;
    result.members = unthunk(async () => {
        const members = await db.all_members(db_group.gid);
        const users = members.map(async (uid) => {
            return user_api.user(uid, context);
        });
        return await Promise.all(users);
    });
    result.subscribers = unthunk(async () => {
        const subscribers = await db.all_subscribers(db_group.gid);
        const users = subscribers.map(async (uid) => {
            return await user_api.user(uid, context);
        });
        return await Promise.all(users);
    });
    result.calendar = unthunk(async () => {
        return await event_api.all_group_events(result.gid, context);
    });
    return result;
}

export async function require_membership(gid: string, context: Context) {
    const authenticated = context.require_user();
    await db.group_with_member(gid, authenticated.uid);
}

async function require_subscribership(gid: string, context: Context) {
    const authenticated = context.require_user();
    await db.group_with_subscriber(gid, authenticated.uid);
}

export async function require_viewership(
    gid: string,
    context: Context,
) {
    const authenticated = context.require_user();
    await db.group_with_viewer(gid, authenticated.uid);
}

async function require_public(gid: string) {
    await db.public_group(gid);
}

async function lazy_index(): Promise<SearchIndex<string>> {
    if (group_index === null) {
        group_index = await create_index();
    }

    return group_index;
}

async function create_index(): Promise<SearchIndex<string>> {
    logger.log({
        level: "info",
        message: "Creating group search index",
    });

    /// Create a new search index
    const index: SearchIndex<string> = new SearchIndex();

    /// Add all the groups to the index
    const db_groups = await db.all_public_groups();
    for (const group of db_groups) {
        await index_group(index, group as Group);
    }

    logger.log({
        level: "info",
        message: "Group search index created",
    });

    return index;
}

async function index_group(
    index: SearchIndex<string>,
    group: Group,
) {
    // Invalidate all previous matches
    index.invalidate(group.gid);

    // Re-insert into index
    if (group.is_public) {
        logger.log({
            level: "info",
            message: `Adding ${group.gid}: ${group.name}`,
        });
        index.insert(group.name, group.gid);
    }
}
