// Test configuration

import * as error from "./error";
import {logger} from "./logger";

// Tests will set this to be true
export const ID: (string | null) = process.env.TEST_ID || null;

// Tests are interactive
const INTERACTIVE: boolean =
    process.env.INTERACTIVE !== undefined &&
    Number(process.env.INTERACTIVE) === 1;

// Check if running in a test environment
export function is_running(): boolean {
    return ID !== null;
}

// Should an interactive server run
export function interactive(): boolean {
    return INTERACTIVE || !is_running();
}

export function require_test() {
    if (!is_running()) {
        throw error.forbidden();
    }
}

export async function require_test_or(check: () => Promise<void>) {
    if (!is_running()) {
        await check();
    }
}

if (!interactive()) {
    // Silence logging when testing
    logger.silent = true;
} else if (is_running()) {
    // Set log level to debug when running in test mode
    logger.level = "debug";
}

if (ID !== null) {
    logger.log({
        level: "info",
        message: `Test ID = ${ID}`,
    });
}
