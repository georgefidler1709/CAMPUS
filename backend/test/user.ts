// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

/*
 * Tests for user account management
 */

import "assert";
import "requires";
import "should";
import { v4 as uuidv4 } from "uuid";
import { Category } from "../database/event";
import { test_mutation, test_query } from "./utils";

const GET_USER: string = `
    query GetUser {
        user { uid, name, show_first, show_never }
    }
`;

const CREATE_USER: string = `
    mutation CreateUser($user: UpdateUser!) {
        create_user(user: $user) {
            uid,
            name,
            show_first,
            show_never,
        }
    }
`;

const UPDATE_USER: string = `
    mutation UpdateUser($user: UpdateUser!) {
        update_user(updated: $user) {
            uid,
            name,
            show_first,
            show_never,
        }
    }
`;

const DELETE_USER: string = `
    mutation DeleteUser { delete_user }
`;

describe("User account management", async () => {
    it("should return no data for an unauthenticated user", async () => {
        await test_query(GET_USER)
            .expect({ user: null });
    });

    it("should return no data for a new user", async () => {
        // Create a user ID
        const uid = uuidv4();

        await test_query(GET_USER)
            .authenticate(uid)
            .expect({ user: null });
    });

    it("should allow a user to initialise their account", async () => {
        // Create a user ID
        const uid = uuidv4();

        // Initialise the user data
        const user = {
            name: "Charles Francis Xavier",
        };
        const expected = {
            uid,
            name: user.name,
            show_first: [],
            show_never: [],
        };
        await test_mutation(CREATE_USER)
            .authenticate(uid)
            .variables({ user })
            .expect({ create_user: expected });

        // Delete the user account
        await test_mutation(DELETE_USER)
            .authenticate(uid)
            .expect({ delete_user: true });
    });

    it("should allow a user to change their name", async () => {
        // Create a user ID
        const uid = uuidv4();

        // Create user with initial name
        const user = {
            name: "Scott Summers",
        };
        const expected = {
            uid,
            name: user.name,
            show_first: [],
            show_never: [],
        };
        await test_mutation(CREATE_USER)
            .authenticate(uid)
            .variables({ user })
            .expect({ create_user: expected });

        // Change the name
        user.name = "Cyclops";
        expected.name = user.name;
        await test_mutation(UPDATE_USER)
            .authenticate(uid)
            .variables({ user })
            .expect({ update_user: expected });

        // Delete the user account
        await test_mutation(DELETE_USER)
            .authenticate(uid)
            .expect({ delete_user: true });
    });

    it("should allow a user to change their preferences", async () => {
        // Create a user ID
        const uid = uuidv4();

        // Create user with initial name
        const user = {
            name: "Erik Lehnsherr",
        };
        const expected = {
            uid,
            name: user.name,
            show_first: [],
            show_never: [],
        };
        await test_mutation(CREATE_USER)
            .authenticate(uid)
            .variables({ user })
            .expect({ create_user: expected });

        // Change the name
        const show_first = [];
        show_first.push("PHYSICS");
        show_first.push("POLITICS");
        expected.show_first = show_first;
        const show_never = [];
        show_never.push("LAW");
        expected.show_never = show_never;
        await test_mutation(UPDATE_USER)
            .authenticate(uid)
            .variables({ user: { show_first, show_never } })
            .expect({ update_user: expected });

        // Delete the user account
        await test_mutation(DELETE_USER)
            .authenticate(uid)
            .expect({ delete_user: true });
    });

    it("should remove the deleted user data", async () => {
        // Create a user ID
        const uid = uuidv4();

        // Create user with initial name
        const user = {
            name: "Jean Elaine Grey",
        };
        const expected = {
            uid,
            name: user.name,
            show_first: [],
            show_never: [],
        };
        await test_mutation(CREATE_USER)
            .authenticate(uid)
            .variables({ user })
            .expect({ create_user: expected });

        // Ensure the user data persists
        await test_query(GET_USER)
            .authenticate(uid)
            .expect({ user: expected });

        // Delete the user account
        await test_mutation(DELETE_USER)
            .authenticate(uid)
            .expect({ delete_user: true });

        // Ensure the user data has been removed
        await test_query(GET_USER)
            .authenticate(uid)
            .expect({ user: null });
    });

});
