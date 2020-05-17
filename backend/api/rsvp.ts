// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// RSVP api for Campus app

import {Context, unthunk} from "../api";
import * as event_api from "../api/event";
import * as user_api from "../api/user";
import * as db from "../database/rsvp";
import * as error from "../error";
import { require_test } from "../test";

export interface RSVP extends db.RSVP {
    event: event_api.Event;
    guest: user_api.User;
}

interface CreateRSVP {
    event: string;
    guest: string;
}

interface UpdateRSVP {
    uid?: string;
    event: string;
    response: db.InviteResponse;
}

// Inflate all result fields
function unpack(
    r: db.RSVP,
    context: Context,
): RSVP {
    const result = r as RSVP;
    result.event = unthunk(() => event_api.fetch_event(result.event_id, context));
    result.guest = unthunk(() => user_api.user(result.guest_id, context));
    return result;
}

// Fetch a specific RSVP
export async function rsvp(
    event: string,
    guest: string,
    context: Context,
): Promise<RSVP | null> {
    const rsvp_obj = await db.rsvp(event, guest);
    if (rsvp_obj == null) {
        return null;
    }
    return unpack(rsvp_obj, context);
}

// Create an invitation for a specified user to a specified event
export async function invite(
    { event, guest }: CreateRSVP,
    context: Context,
): Promise<RSVP> {
    await db.require_invitable(event, context);
    const result = await db.create_invite(event, guest);
    return unpack(result, context);
}

// Respond to an invitation
export async function respond(
    { event, response }: UpdateRSVP,
    context: Context,
): Promise<db.RSVP> {
    await db.require_attendable(event, context);
    const authenticated = context.require_user();
    const remaining_capacity = await db.remaining_capacity(event);
    if (
        response === "ATTENDING" &&
        remaining_capacity !== null &&
        remaining_capacity <= 0
    ) {
        // If the capacity is exceeded the RSVP will not be set to
        // attending
        response = "INVITED";
    }
    const result = await db.update_invite(event, authenticated.uid, response);
    return unpack(result, context);
}

// Respond to an invitation
export async function respond_with_id(
    { uid, event, response }: UpdateRSVP,
    context: Context,
): Promise<db.RSVP> {
    require_test();
    const remaining_capacity = await db.remaining_capacity(event);
    if (
        response === "ATTENDING" &&
        remaining_capacity !== null &&
        remaining_capacity <= 0
    ) {
        // If the capacity is exceeded the RSVP will not be set to
        // attending
        response = "INVITED";
    }
    const result = await db.update_invite(event, uid, response);
    return unpack(result, context);
}

// Return all RSVPs for a specific event
export async function all_rsvps_event(
    eid: string,
    context: Context,
): Promise<RSVP[]> {
    const result = await db.all_rsvps_event(eid) as RSVP[];
    for (const r of result) {
        unpack(r, context);
    }
    return result;
}
