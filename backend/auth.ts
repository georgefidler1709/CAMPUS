// Authentication module

import * as express from "express";
import * as admin from "firebase-admin";
import {malformed_authorization} from "./error";
import {logger} from "./logger";
import * as test from "./test";

// Users authenticated via firebase
export class User {
    public readonly subject: string;
    public readonly uid: string;
    public readonly name?: string;
    public readonly email?: string;

    constructor(
        subject: string,
        uid: string,
        name?: string,
        email?: string,
    ) {
        this.subject = subject;
        this.uid = uid;
        this.name = name;
        this.email = email;
    }

    public decoded(token: admin.auth.DecodedIdToken): User {
        return new User(
            token.sub,
            token.uid,
            token.name || null,
            token.email || null,
        );
    }
}

// Authenticate a request with firebase
export async function authenticate(
    request: express.Request,
): Promise<(User | null)> {
    const token = request.get("Authorization");
    if (typeof token !== "string") {
        logger.log({
            level: "info",
            message: `Guest request`,
        });
        return null;
    } else {
        const split_token = token.split(/\s+/);
        if (split_token.length !== 2 || split_token[0] !== "Bearer") {
            throw malformed_authorization(token);
        }
        const auth_token = split_token[1];
        let user: User;
        if (test.is_running()) {
            user = new User(auth_token, auth_token, null, null);
        } else {
            const verified = await admin
                .auth()
                .verifyIdToken(auth_token);
            user = User.prototype.decoded(verified);
        }
        logger.log({
            level: "info",
            message: `User request: ${user.subject}`,
        });
        return user;
    }
}
