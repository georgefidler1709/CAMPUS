// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// RSVP database for Campus app

// import {CollectionReference, DocumentReference, DocumentSnapshot} from "@google-cloud/firestore";
import { Context } from "../api";
import * as group from "../api/group";
import {firestore} from "../database";
import { Event } from "../database/event";
import * as error from "../error";
import {logger} from "../logger";

export interface RSVP {
    event_id: string;
    guest_id: string;
    response: InviteResponse;
}

export type InviteResponse = (
    "INVITED" |
    "ATTENDING" |
    "NOT_ATTENDING"
);

// A user is able to attend any event where:
//
//  * they own it (either directly or via group,
//  * it is public, or
//  * they have already been invited to it.
export async function require_attendable(
    event: string,
    context: Context,
) {
    const user = context.require_user();
    const invite = await firestore
        .collection("events").doc(event)
        .collection("rsvps").doc(user.uid).get();

    if (!invite.exists) {
        require_invitable(event, context, true);
    }
}

// A user is able to invite another user to any event where:
//
//  * they own it (either directly or via group, or
//  * it is public.
export async function require_invitable(
    event_id: string,
    context: Context,
    allow_subscriber?: boolean,
) {
    const authenticated = context.require_user();
    const event_doc = await firestore
        .collection("events")
        .doc(event_id)
        .get();

    if (!event_doc.exists) {
        throw error.event_not_found(event_id);
    }

    const { public_event, owner, owned_by } = event_doc.data() as Event;

    if (!public_event) {
        if (owned_by === "USER") {
            if (owner !== authenticated.uid) {
                throw error.rsvp_forbidden(authenticated.uid, event_id);
            }
        } else if (owned_by === "GROUP") {
            if (allow_subscriber) {
                group.require_viewership(owner, context);
            } else {
                group.require_membership(owner, context);
            }
        } else {
            throw error.rsvp_forbidden(authenticated.uid, event_id);
        }
    }
}

// Fetch an RSVP from the database
export async function rsvp(
    event: string,
    guest: string,
): Promise<RSVP | null> {
    logger.log({
        level: "info",
        message: `Requesting rsvp for user ${guest} and event ${event}`,
    });

    const rsvp_doc = await firestore
        .collection("events").doc(event)
        .collection("rsvps").doc(guest).get();

    if (rsvp_doc.exists) {
        const result =  rsvp_doc.data() as RSVP;
        result.event_id = event;
        return result;
    } else {
        return null;
    }
}

// Create an event invitation
export async function create_invite(
    event_id: string,
    guest_id: string,
): Promise<RSVP> {
    logger.log({
        level: "info",
        message: `Creating invitation for user: ${guest_id} to event: ${event_id}`,
    });

    // Check whether guest is valid?

    const invite_doc = await firestore
        .collection("events").doc(event_id)
        .collection("rsvps").doc(guest_id).get();

    // Only create the invitation if the guest has not previously received one
    if (!invite_doc.exists) {
        let response: InviteResponse;
        response = "INVITED";
        await invite_doc.ref.set({ guest_id, response });
    }

    return rsvp(event_id, guest_id);
}

// Respond to an event invitation
export async function update_invite(
    event_id: string,
    guest_id: string,
    response: InviteResponse,
): Promise<RSVP> {
    logger.log({
        level: "info",
        message: `Updating invitation for user: ${guest_id} to event: ${event_id},
                  status: ${response}`,
    });

    const invite_doc = await firestore
        .collection("events").doc(event_id)
        .collection("rsvps").doc(guest_id).get();

    if (invite_doc.exists) {
        await invite_doc.ref.update({ response });
    } else {
        await invite_doc.ref.set({ guest_id, response });
    }
    return rsvp(event_id, guest_id);
}

// Fetch all rsvps for specified event
export async function all_rsvps_event(
    event: string,
): Promise<RSVP[]> {
    logger.log({
        level: "info",
        message: `Fetching all of the rsvps for event: ${event}`,
    });

    const rsvp_doc = await firestore
            .collection("events").doc(event)
            .collection("rsvps").get();
    const rsvps = rsvp_doc.docs.map((doc) => {
        const data = doc.data() as RSVP;
        data.event_id = event;
        return data;
    });

    return rsvps;
}

export async function remaining_capacity(
    event: string,
): Promise<(number | null)> {
    logger.log({
        level: "info",
        message: `Checking capacity for event: ${event}`,
    });

    const event_doc = await firestore
        .collection("events")
        .doc(event)
        .get();

    if (!event_doc.exists) {
        throw error.event_not_found(event);
    }

    const event_capacity = event_doc.data().capacity || null;

    if (event_capacity === null) {
        return null;
    }

    const rsvps = await firestore
        .collection("events")
        .doc(event)
        .collection("rsvps")
        .where("response", "==", "ATTENDING")
        .get();

    return event_capacity - rsvps.docs.length;
 }
