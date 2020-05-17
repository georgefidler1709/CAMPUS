/*
 * Utilities for creating and running tests
 */

import "assert";
import "requires";
import "should";
import * as request from "supertest";
import { app } from "..";

type Query = "query" | "mutation";

// Wrapper around supertest for testing the API
export class ApiTest {
    private kind: Query;
    private query: string;
    private variable_data: any;
    private uid?: string;

    constructor(kind: Query, query: string) {
        this.kind = kind;
        this.uid = null;
        this.query = query;
        this.variable_data = {};
    }

    public authenticate(uid: string): ApiTest {
        this.uid = uid;
        return this;
    }

    public variables(data: any): ApiTest {
        this.variable_data = data;
        return this;
    }

    public async expect_status(http_status: number) {
        await this.build().expect(http_status);
    }

    public async expect(data: any) {
        await this.build().expect({ data }).expect(200);
    }

    private build(): request.Test {
        let test: request.Test;
        if (this.kind === "query") {
            test = request(app).get("/api");
        } else {
            test = request(app).post("/api");
        }

        test.send({
            query: this.query,
            variables: this.variable_data,
        });

        if (this.uid !== null) {
            test.set("Authorization", `Bearer ${this.uid}`);
        }

        return test;
    }
}

export function test_query(query: string): ApiTest {
    return new ApiTest("query", query);
}

export function test_mutation(query: string): ApiTest {
    return new ApiTest("mutation", query);
}
