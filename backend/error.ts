// Errors produced by the backend

import {Request, Response} from "express";
import {logger} from "./logger";

// Interface for all exceptions raised to be presented to the user
export class ApiError extends Error {
    // HTML Error status
    public readonly statusCode: number;
    // Error text to send to the user
    public readonly message: string;

    constructor(statusCode: number, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

// HTTP status codes
enum StatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
}

// Wrappers for particular errors

// Malformed authorization header
export function malformed_authorization(token: string): ApiError {
    logger.log({
        level: "warn",
        message: `Malformed 'Authorization' header: ${token}`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Malformed 'Authorization' header: ${token}`,
    );
}

// Malformed authorization header
export function unauthorized(): ApiError {
    logger.log({
        level: "warn",
        message: `User not authenticated`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `User not authenticated`,
    );
}

// Malformed authorization header
export function forbidden(): ApiError {
    logger.log({
        level: "warn",
        message: `Request is forbidden`,
    });
    return new ApiError(
        StatusCode.Forbidden,
        `Request is forbidden`,
    );
}

// Object missing fields in request
export function missing_fields(data: any, fields: string[]): ApiError {
    logger.log({
        level: "warn",
        message: `Request object ${data} missing fields ${fields}`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Request object ${data} missing fields ${fields}`,
    );
}

// Invalid location path requested
export function invalid_location(id: string): ApiError {
    logger.log({
        level: "warn",
        message: `Invalid location ID: ${id}`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Invalid location ID: ${id}`,
    );
}

// No event found matching this ID
export function event_not_found(eid: string): ApiError {
    logger.log({
        level: "warn",
        message: `Event not found: ${eid}`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Event not found: ${eid}`,
    );
}

// User not authorised to modify this event
export function event_unauthorized(user: string, eid: string): ApiError {
    logger.log({
        level: "warn",
        message: `User ${user} not authorized to modify event: ${eid}`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `User ${user} not authorized to modify event: ${eid}`,
    );
}

// User not authorised to modify this event
export function rsvp_forbidden(user: string, event: string): ApiError {
    logger.log({
        level: "warn",
        message: `User ${user} not allowed to RSVP to event ${event}`,
    });
    return new ApiError(
        StatusCode.Forbidden,
        `User ${user} not allowed to RSVP to event ${event}`,
    );
}

// The event is full and has no further capacity
export function event_full(event: string): ApiError {
    logger.log({
        level: "warn",
        message: `Event ${event} has reached maximum capacity`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Event ${event} has reached maximum capacity`,
    );
}

/// Requested group does not exist
export function group_not_found(group: string) {
    logger.log({
        level: "warn",
        message: `Group not found: ${group}`,
    });
    return new ApiError(
        StatusCode.BadRequest,
        `Group not found: ${group}`,
    );
}

/// User tried to modify group of which they are not a member
export function not_group_member(
    user: string,
    group: string,
): ApiError {
    logger.log({
        level: "warn",
        message: `User ${user} not a member of ${group}`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `User ${user} not a member of ${group}`,
    );
}

/// User tried to modify group of which they are not a subscriber
export function not_group_subscriber(
    user: string,
    group: string,
): ApiError {
    logger.log({
        level: "warn",
        message: `User ${user} not a subscriber of ${group}`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `User ${user} not a subscriber of ${group}`,
    );
}

/// User tried to view a group to which they don't have access
export function not_group_viewer(
    user: string,
    group: string,
): ApiError {
    logger.log({
        level: "warn",
        message: `User ${user} does not have access to view group ${group}`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `User ${user} does not have access to view group ${group}`,
    );
}

/// User tried to modify group of which they are not a member
export function group_not_public(group: string): ApiError {
    logger.log({
        level: "warn",
        message: `Group ${group} is not public`,
    });
    return new ApiError(
        StatusCode.Unauthorized,
        `Group ${group} is not public`,
    );
}

export function handleError(
    error: ApiError,
    _request: Request,
    response: Response,
    next: () => void,
) {
    response
        .status(error.statusCode)
        .json({
            errors: [{
                message: error.message,
            }],
        });
    next();
}
