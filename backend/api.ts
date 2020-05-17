// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// API configuration
// This is the main API interface defining the context information
// as well as the full list of available functions.

import {Request} from "express";
import * as graphqlHTTP from "express-graphql";
import {readFileSync} from "fs";
import * as graphql from "graphql";
import * as event from "./api/event";
import * as group from "./api/group";
import * as location from "./api/location";
import * as rsvp from "./api/rsvp";
import * as user_api from "./api/user";
import * as auth from "./auth";
import * as user_db from "./database/user";
import * as error from "./error";
import * as test from "./test";

// Load the graphql schema
const schema = graphql
    .buildSchema(readFileSync("schema.gql").toString("utf8"));

// Request context
export class Context {
    // Authenticated user, if any
    public readonly user?: auth.User;

    constructor(user: auth.User | null) {
        this.user = user;
    }

    // Throw an error if the user has not been authenticated
    public require_user(): auth.User {
        if (this.user == null) {
            throw error.unauthorized();
        } else {
            return this.user;
        }
    }
}

export const handler = graphqlHTTP(async (request: Request) => {
    const user = await auth.authenticate(request);
    return {
        context: new Context(user),
        graphiql: test.is_running(),
        pretty: true,
        rootValue: root,
        schema,
    };
});

// Because the GraphQL tool will evaluate functions for use before
// sending the response to the user (and it will only do that when the
// user has requested that part of the object to be returned) we can
// pretend these functions are the type they would instead return when
// evaluated.
export function unthunk<T>(value: Promise<T> | (() => Promise<T>)): T {
    return value as unknown as T;
}

// GraphQL query resolvers
const root = {
    // The UUID for the current test environment
    test_id: test.ID,
    // The name of the current user
    user: async (_: {}, context: Context) => {
        if (context.user !== null) {
            const user = await user_api.user(context.user.uid, context);
            if (user !== null) {
               // user.uid = context.user.uid;
                return user;
            } else {
                return null;
            }
        } else {
            return null;
        }
    },

    ping: async ({id}) => {
        return id + 1;
    },

    // API functions /////////////////////////////////

    /* User management API */
    search_users: user_api.search_users,
    create_user: user_api.create_user,
    create_user_with_id: user_api.create_user_with_id,
    update_user: user_api.update_user,
    update_user_with_id: user_api.update_user_with_id,
    delete_user: user_api.delete_user,
    delete_user_with_id: user_api.delete_user_with_id,
    all_users: user_api.all_users,

    /* Group management API */
    group: group.view_group,
    public_groups: group.public_groups,
    search_public_groups: group.search_public_groups,
    create_group: group.create_group,
    create_group_for_user: group.create_group_for_user,
    update_group: group.update_group,
    add_group_member: group.add_group_member,
    remove_group_member: group.remove_group_member,
    subscribe_to_group: group.subscribe_to_group,
    unsubscribe_from_group: group.unsubscribe_from_group,
    subscribe_user_to_group: group.subscribe_user_to_group,
    unsubscribe_user_from_group: group.unsubscribe_user_from_group,
    delete_group: group.delete_group,

    /* Location management API */
    locations: location.locations,
    location: location.single_location,
    search_locations: location.search_locations,
    create_location: location.create_location,
    update_location: location.update_location,
    delete_location: location.delete_location,
    create_entrance: location.create_entrance,
    update_entrance: location.update_entrance,
    delete_entrance: location.delete_entrance,
    create_amenity: location.create_amenity,
    update_amenity: location.update_amenity,
    delete_amenity: location.delete_amenity,

    /* Event management API */
    event: event.event,
    search_events: event.search_events,
    create_event: event.create_event,
    create_group_event: event.create_group_event,
    create_event_with_owner: event.create_event_with_owner,
    update_event: event.update_event,
    update_event_without_owner: event.update_event_without_owner,
    delete_event: event.delete_event,
    delete_event_without_owner: event.delete_event_without_owner,
    all_events: event.all_events,
    all_public_events: event.all_public_events,
    all_public_events_with_prefs: event.all_public_events_with_prefs,
    all_owned_events: event.all_owned_events,

    rsvp: rsvp.rsvp,
    invite: rsvp.invite,
    respond: rsvp.respond,
    respond_with_id: rsvp.respond_with_id,
};
