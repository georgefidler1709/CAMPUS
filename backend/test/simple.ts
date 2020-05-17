/* Simple test query */

import "assert";
import "requires";
import "should";
import * as test from "../test";
import { test_query } from "./utils";

describe("Empty API request", async () => {
    it("should return a 200 for a guest request", async () => {
        await test_query("{ user { uid } }")
            .expect({ user: null });
    });
});

/// Re-used queries

const PING: string = `
    query Ping($id: Int!) {
        ping(id: $id)
    }
`;

describe("Basic API tests", async () => {
    it("Return the ping response with incremented value", async () => {
        await test_query(PING)
            .variables({ id: 1 })
            .expect({ ping: 2 });
    });

    it("Return the current test ID", async () => {
        await test_query("{ test_id }")
            .expect({ test_id: test.ID });
    });
});
