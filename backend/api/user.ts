// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// ! User management API

import {Context, unthunk} from "../api";
import {all_events_user, Event} from "../api/event";
import { Category } from "../database/event";
import { logger } from "../logger";
import { SearchIndex } from "../search-index";

import * as db from "../database/user";
import * as test from "../test";
import * as group from "./group";

/// Lazily initialised location search index
let user_index: SearchIndex<string> = null;

export interface User extends db.User {
    calendar: Event[];
    groups: group.Group[];
    subscriptions: group.Group[];
}

// Request interfaces
interface CreateUser {
    uid?: string;
    user: db.User;
}

interface UpdateUser {
    uid?: string;
    updated: db.User;
}

interface DeleteUser {
    uid?: string;
}

interface SearchUsers {
    query: string;
}

// Inflate all fields in user object
function unpack(u: db.User, context: Context): User {
    const result = u as User;
    result.calendar = unthunk(() => all_events_user(u.uid, context));
    result.groups = unthunk(() => group.with_member(u.uid, context));
    result.subscriptions =
        unthunk(() => group.with_subscriber(u.uid, context));
    return result;
}

export async function user(
    uid: string,
    context: Context,
): Promise<User | null> {
    const data = await db.user(uid);
    if (data == null) {
        return null;
    }
    return unpack(data, context);
}

// Search for user by name
export async function search_users(
    {query}: SearchUsers,
    context: Context,
): Promise<db.SearchUser[]> {
    const index = await lazy_index();
    const matches = index
        .search(query)
        .map(async (match) => await db.user(match));
    const results = await Promise.all(matches);
    return results.map((result) => result as db.SearchUser);
}

// Update the details of the current user
export async function create_user(
    { user: data }: CreateUser,
    context: Context,
): Promise<User> {
    const authenticated = context.require_user();
    const created = await db.create_user(authenticated.uid, data);
    await index_user(await lazy_index(), authenticated.uid, created.name);
    return unpack(created, context);
}

// Update the details of the current user
export async function create_user_with_id(
    { uid, user: data }: CreateUser,
    context: Context,
): Promise<db.User> {
    test.require_test();
    const created = await db.create_user(uid, data);
    await index_user(await lazy_index(), uid, created.name);
    return unpack(created, context);
}

// Update the details of the current user
export async function update_user(
    {updated}: UpdateUser,
    context: Context,
): Promise<db.User> {
    const authenticated = context.require_user();
    const result = await db.update_user(authenticated.uid, updated);
    if (updated.name) {
        await index_user(await lazy_index(), authenticated.uid, updated.name);
    }
    return unpack(result, context);
}

// Update the details of the current user
export async function update_user_with_id(
    {updated, uid}: UpdateUser,
    context: Context,
): Promise<db.User> {
    test.require_test();
    const result = await db.update_user(uid, updated);
    if (updated.name) {
        await index_user(await lazy_index(), uid, updated.name);
    }
    return unpack(result, context);
}

// Update the details of the current user
export async function delete_user(
    _: DeleteUser,
    context: Context,
): Promise<boolean> {
    const authenticated = context.require_user();
    await db.delete_user(authenticated.uid);
    await delete_index(await lazy_index(), authenticated.uid);
    return true;
}

// Update the details of the current user
export async function delete_user_with_id(
    {uid}: DeleteUser,
): Promise<boolean> {
    test.require_test();
    await db.delete_user(uid);
    await delete_index(await lazy_index(), uid);
    return true;
}

// Gets all users
export async function all_users(context: Context): Promise<User[]> {
    const result = await db.all_users() as User[];
    for (const u of result) {
        unpack(u, context);
    }
    return result;
}

// Search indexing functionality ///////////////////////
// Create or fetch search index
async function lazy_index(): Promise<SearchIndex<string>> {
    if (user_index === null) {
        user_index = await create_index();
    }

    return user_index;
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
    const db_users = await db.search_users();
    for (const u of db_users) {
        await index_user(index, u.uid, u.name);
    }

    logger.log({
        level: "info",
        message: "User search index created",
    });

    return index;
}

// Index an event by name
async function index_user(
    index: SearchIndex<string>,
    uid: string,
    name: string,
) {
    // Invalidate all previous matches
    index.invalidate(uid);

    logger.log({
        level: "info",
        message: `Adding ${uid}: ${name}`,
    });
    index.insert(name, uid);
}

// Invalidate all matches for a specific event id
async function delete_index(
    index: SearchIndex<string>,
    uid: string,
) {
    index.invalidate(uid);
}
