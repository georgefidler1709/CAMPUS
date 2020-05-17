// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// User operations and data types within the database

import { default_fields, firestore, require_fields } from "../database";
import { Category } from "../database/event";
import { logger } from "../logger";
import * as test from "../test";

export interface User extends SearchUser {
    show_first: Category[];
    show_never: Category[];
}

export interface SearchUser {
    name: string;
    uid?: string;
}

// Find a user in the database
export async function user(uid: string): Promise<(User | null)> {
    logger.log({
        level: "info",
        message: `Requesting user with UID ${uid}`,
    });

    const doc = await firestore.collection("users").doc(uid).get();

    if (doc.exists) {
        const result = doc.data() as User;
        result.uid = uid;
        return result;
    } else {
        return null;
    }
}

// Create a new user in the database
export async function create_user(
    uid: string,
    data: User,
): Promise<User> {
    require_fields(data, ["name"]);
    logger.log({
        level: "info",
        message: `Creating user ${data.name} with UID ${uid}`,
    });
    // Add user to database
    const doc = await firestore.collection("users").doc(uid).get();

    // Only create a new user if one doesn't exist, otherwise set the
    // name.
    if (doc.exists) {
        await doc.ref.update(data);
    } else {
        default_fields(data, { show_first: [], show_never: [] });
        await doc.ref.set(data);
    }

    // Make sure the user was created
    return user(uid);
}

// Update a user in the database
export async function update_user(
    uid: string,
    updated: User,
): Promise<User> {
    logger.log({
        level: "info",
        message: `Updating user with UID ${uid}`,
    });
    // Add user to database
    await firestore.collection("users").doc(uid).update(updated);
    return user(uid);
}

// Delete a user from the database
export async function delete_user(uid: string) {
    logger.log({
        level: "info",
        message: `Deleting user with UID ${uid}`,
    });
    // Add user to database
    await firestore.collection("users").doc(uid).delete();
}

// Find all users in the database
export async function all_users(): Promise<User[]> {
    // This request only works in testing environments
    test.require_test();

    logger.log({
        level: "info",
        message: `Fetching all of the users`,
    });

    const query = await firestore.collection("users").get();
    const users = query.docs.map((doc) => {
        const data = doc.data() as User;
        data.uid = doc.id;
        return data;
    });

    return users;
}

// Find users that can be searched
export async function search_users(): Promise<SearchUser[]> {
    // This request only works in testing environments
    logger.log({
        level: "info",
        message: `Fetching all of the users' search data`,
    });

    const query = await firestore.collection("users").get();
    const users = query.docs.map((doc) => {
        const data = doc.data() as SearchUser;
        data.uid = doc.id;
        return data;
    });

    return users;
}
