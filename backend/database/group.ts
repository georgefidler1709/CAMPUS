// COMP3900 Good Vibes Only Group Project
// Curtis Millar (z3424700), Eleni Dimitriadis (z5191013)
// George Fidler (z5160384), Misha Cajic (z5117366)

// Group operations within the database

import {
    default_fields,
    delete_all,
    firestore,
    require_fields,
} from "../database";
import * as error from "../error";
import { logger } from "../logger";
import * as test from "../test";

export interface Group {
    gid?: string;
    name: string;
    description?: string;
    is_public: boolean;
}

export async function group_with_member(gid: string, member: string) {
    const doc = await firestore
        .collection("groups").doc(gid)
        .collection("member").doc(member)
        .get();

    if (!doc.exists) {
        throw error.not_group_member(member, gid);
    }
}

export async function group_with_subscriber(
    gid: string,
    subscriber: string,
) {
    const doc = await firestore
        .collection("groups").doc(gid)
        .collection("subscriber").doc(subscriber)
        .get();

    if (!doc.exists) {
        throw error.not_group_subscriber(subscriber, gid);
    }
}

export async function group_with_viewer(
    gid: string,
    viewer?: string,
): Promise<Group> {
    const group_doc = await firestore
        .collection("groups")
        .doc(gid)
        .get();

    if (!group_doc.exists) {
        throw error.group_not_found(gid);
    }

    const data = group_doc.data() as Group;
    data.gid = group_doc.id;

    if (test.is_running() || data.is_public) {
        return data;
    } else if (viewer == null) {
        throw error.unauthorized();
    }

    const subscriber_doc = await firestore
        .collection("groups").doc(gid)
        .collection("subscriber").doc(viewer)
        .get();

    if (subscriber_doc.exists) {
        return data;
    }

    const member_doc = await firestore
        .collection("groups").doc(gid)
        .collection("member").doc(viewer)
        .get();

    if (member_doc.exists) {
        return data;
    }

    throw error.not_group_viewer(viewer, gid);
}

export async function public_group(gid: string) {
    const found = await group(gid);

    if (!found.is_public) {
        throw error.group_not_public(gid);
    }
}

export async function all_public_groups(): Promise<Group[]> {
    logger.log({
        level: "info",
        message: `Requesting all public groups`,
    });

    const groups = await firestore
        .collection("groups")
        .where("is_public", "==", true)
        .get();

    return groups.docs.map((doc) => {
        const data = doc.data() as Group;
        data.gid = doc.id;
        return data;
    });
}

export async function group(gid: string): Promise<Group> {
    logger.log({
        level: "info",
        message: `Requesting group with ID ${gid}`,
    });

    const doc = await firestore.collection("groups").doc(gid).get();

    if (!doc.exists) {
        throw error.group_not_found(gid);
    }

    const data = doc.data() as Group;
    data.gid = doc.id;
    return data;
}

export async function create_group(new_group: Group): Promise<Group> {
    logger.log({
        level: "info",
        message: `Creating Group: ${new_group.name}`,
    });

    require_fields(new_group, [ "name" ]);
    default_fields(new_group, { is_public: false });

    const added = await firestore
        .collection("groups")
        .add(new_group);
    const doc = await added.get();

    logger.log({
        level: "info",
        message: `Creating Group: ${new_group.name} with ID ${doc.id}`,
    });

    const data = doc.data() as Group;
    data.gid = doc.id;
    return data;
}

export async function update_group(
    gid: string,
    updated: Group,
): Promise<Group> {
    logger.log({
        level: "info",
        message: `Updating group: ${updated.name} with ID ${gid}`,
    });

    const doc = await firestore.collection("groups").doc(gid).get();

    if (doc.exists) {
        await doc.ref.update(updated);
    } else {
        throw error.group_not_found(gid);
    }

    return group(gid);
}

export async function delete_group(gid: string) {
    logger.log({
        level: "info",
        message: `Deleting group with ID ${gid}`,
    });

    const doc = firestore.collection("groups").doc(gid);
    await delete_all(doc.collection("subscriber"));
    await delete_all(doc.collection("member"));
    await doc.delete();
}

export async function add_member(
    gid: string,
    user: string,
): Promise<Group> {
    return await add_user(gid, user, "member");
}

export async function remove_member(
    gid: string,
    user: string,
): Promise<Group> {
    return await remove_user(gid, user, "member");
}

export async function all_groups_with_member(
    user: string,
): Promise<Group[]> {
    return await all_groups_with_user(user, "member");
}

export async function all_members(gid): Promise<string[]> {
    return await all_users_with_relation(gid, "member");
}

export async function add_subscriber(
    gid: string,
    user: string,
): Promise<Group> {
    return await add_user(gid, user, "subscriber");
}

export async function remove_subscriber(
    gid: string,
    user: string,
): Promise<Group> {
    return await remove_user(gid, user, "subscriber");
}

export async function all_groups_with_subscriber(
    user: string,
): Promise<Group[]> {
    return await all_groups_with_user(user, "subscriber");
}

export async function all_subscribers(gid): Promise<string[]> {
    return await all_users_with_relation(gid, "subscriber");
}

async function add_user(
    gid: string,
    user: string,
    relation: string,
): Promise<Group> {
    logger.log({
        level: "info",
        message: `Adding ${relation} ${user} to group with ID ${gid}`,
    });

    const doc = await firestore.collection("groups").doc(gid).get();

    if (!doc.exists) {
        throw error.group_not_found(gid);
    }

    await doc.ref
        .collection(relation)
        .doc(user)
        .set({ subscriber: user });

    const data = doc.data() as Group;
    data.gid = doc.id;
    return data;
}

async function remove_user(
    gid: string,
    user: string,
    relation: string,
): Promise<Group> {
    logger.log({
        level: "info",
        message: `Removing ${relation} ${user} from group with ID ${gid}`,
    });

    await firestore
        .collection("groups").doc(gid)
        .collection(relation).doc(user)
        .delete();

    return await group(gid);
}

async function all_groups_with_user(
    user: string,
    relation: string,
): Promise<Group[]> {
    logger.log({
        level: "info",
        message: `Finding all groups of which ${user} is a ${relation}`,
    });

    // This seems woefully inefficient but I can't think of a better
    // way to to do this at the moment. :(

    const groups = await firestore.collection("groups").get();

    const with_filter = groups
        .docs
        .map(async (doc) => {
            const relationship = await doc.ref
                .collection(relation)
                .doc(user)
                .get();

            if (relationship.exists) {
                const data = doc.data();
                data.gid = doc.id;
                return data as Group;
            } else {
                return null as Group;
            }
        });

    const filtered = await Promise.all(with_filter);

    return filtered.filter((doc) => doc != null);
}

async function all_users_with_relation(
    gid: string,
    relation: string,
): Promise<string[]> {
    logger.log({
        level: "info",
        message: `Finding all ${relation}s of group ${gid}`,
    });

    const related = await firestore
        .collection("groups").doc(gid)
        .collection(relation).get();
    return related.docs.map((doc) => doc.id);
}
