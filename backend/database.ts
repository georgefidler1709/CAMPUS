// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// Database wrapper
//
// (Also provides in-memory database when running tests)

import {CollectionReference, Firestore} from "@google-cloud/firestore";
import * as error from "./error";
import {logger} from "./logger";
import * as test from "./test";

if (test.is_running() && !("FIRESTORE_EMULATOR_HOST" in process.env)) {
    logger.silent = false;
    logger.log({
        level: "error",
        message: "Firestore emulator not running in test (gcloud beta emulators firestore start)",
    });
    process.exit(1);
}

// Connect to Firestore
export const firestore = new Firestore();

// Ensure that a the given fields are present in an object
export function require_fields(value: object, fields: string[]) {
    const missing = [];
    for (const field of fields) {
        if (value[field] === undefined) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        throw error.missing_fields(value, missing);
    }
}

// Set missing fields to sane defaults
export function default_fields(value: object, defaults: object) {
    for (const [field, default_value] of Object.entries(defaults)) {
        if (value[field] === undefined) {
            value[field] = default_value;
        }
    }
}

// Delete all of the elements within a collection
export async function delete_all(collection: CollectionReference) {
    const elements = await collection.get();
    for (const element of elements.docs) {
        await collection.doc(element.id).delete();
    }
}
