// Location operations and datatypes within the database

import {CollectionReference, DocumentReference, DocumentSnapshot} from "@google-cloud/firestore";
import {default_fields, firestore, require_fields} from "../database";
import {invalid_location} from "../error";

export interface Location {
    id?: string;
    parent?: string;
    name: string;
    latlong: LatLong;
    aliases: string[];
    capacity?: number;
    bookable?: boolean;
}

export interface Entrance {
    id?: string;
    latlong: LatLong;
    kind: EntranceKind;
    connection: EntranceConnection;
    connected?: string;
}

export type EntranceKind = (
    "DOOR" |
    "STAIRWAY" |
    "ELEVATOR"
);

export type EntranceConnection = (
    "JOINS_PARENT" |
    "JOINS_CHILD" |
    "JOINS_SIBLING"
);

export interface Amenity {
    id?: string;
    description: string;
    latlong: LatLong;
    services: Service[];
}

export type Service = (
    "BATHROOM" |
    "MALE_BATHROOM" |
    "FEMALE_BATHROOM" |
    "UNISEX_BATHROOM" |
    "DISABLED_BATHROOM" |
    "SHOWER" |
    "KITCHEN" |
    "COLD_WATER" |
    "HOT_WATER" |
    "MICROWAVE" |
    "WATER_POST" |
    "BUBBLER" |
    "BOTTLE_REFILL"
);

export interface LatLong {
    latitude: number;
    longitude: number;
}

function location_with_id(id: string): DocumentReference {
    const location = firestore.collection("locations").doc(id);

    if (location === null) {
        throw invalid_location(id);
    }

    return location;
}

/// Get a specific location
export async function single_location(
    id: string,
): Promise<Location> {
    const location = location_with_id(id);
    const doc = await location.get();

    if (doc.exists) {
        const data = doc.data() as Location;
        data.id = doc.id;
        return data;
    } else {
        throw invalid_location(id);
    }
}

/// Get all of the locations with a particular parent
export async function all_locations(): Promise<Location[]> {
    const locations = await firestore
        .collection("locations")
        .get();

    return locations.docs.map((doc: DocumentSnapshot) => {
        const data = doc.data() as Location;
        data.id = doc.id;
        return data;
    });
}

/// Get all of the locations with a particular parent
export async function locations_with_parent(
    parent: (string | null),
): Promise<Location[]> {
    const locations = await firestore
        .collection("locations")
        .where("parent", "==", parent)
        .get();

    return locations.docs.map((doc: DocumentSnapshot) => {
        const data = doc.data() as Location;
        data.id = doc.id;
        return data;
    });
}

// Create a location user in the database
export async function create_location(
    parent: (string | null),
    location: Location,
): Promise<Location> {
    // Set required fields and defaults for creating new location
    require_fields(location, ["name", "latlong"]);
    default_fields(
        location,
        {
            parent: (parent || null),
            aliases: [],
            bookable: false,
        },
    );

    const created = await firestore
        .collection("locations")
        .add(location);

    const doc = await created.get();

    const data = doc.data() as Location;
    data.id = doc.id;
    return data;
}

// Update a location in the database
export async function update_location(
    id: string,
    updated: Location,
): Promise<Location> {
    await location_with_id(id).update(updated);
    return await single_location(id);
}

// Delete a location from the database
export async function delete_location(id: string) {
    await location_with_id(id).delete();
}

/// Get all of the entances with a particular parent
export async function entrances(
    location: string,
): Promise<Entrance[]> {
    const parent_location = location_with_id(location);
    const query = await parent_location.collection("entrances").get();

    return query.docs.map((doc: DocumentSnapshot) => {
        const data = doc.data() as Entrance;
        data.id = doc.id;
        return data;
    });
}

// Create a new entrance in the database
export async function create_entrance(
    location: string,
    entrance: Entrance,
): Promise<Entrance> {
    // Set required fields and defaults for creating new entrance
    default_fields(
        entrance,
        {
            kind: "DOOR",
            connection: "JOINS_PARENT",
        },
    );
    const required = ["latlong"];
    if (entrance.connection !== "JOINS_PARENT") {
        required.push("connected");
    }
    require_fields(entrance, required);

    const parent_location = location_with_id(location);
    const parent_doc = await parent_location.get();
    if (!parent_doc.exists) {
        throw invalid_location(location);
    }

    const created = await parent_doc.ref
        .collection("entrances")
        .add(entrance);

    const doc = await created.get();

    const data = doc.data() as Entrance;
    data.id = doc.id;
    return data;
}

// Update an entrance in the database
export async function update_entrance(
    location: string,
    entrance: string,
    updated: Entrance,
): Promise<Entrance> {
    const doc_ref = location_with_id(location)
        .collection("entrances")
        .doc(entrance);
    await doc_ref.update(updated);

    const doc = await doc_ref.get();
    const data = doc.data() as Entrance;
    data.id = doc.id;
    return data;
}

// Delete an entance from the database
export async function delete_entrance(
    location: string,
    entrance: string,
) {
    await location_with_id(location)
        .collection("entrances")
        .doc(entrance)
        .delete();
}

/// Get all of the amenities with a particular parent
export async function amenities(
    location: string,
): Promise<Amenity[]> {
    const parent_location = location_with_id(location);
    const query = await parent_location.collection("amenities").get();

    return query.docs.map((doc: DocumentSnapshot) => {
        const data = doc.data() as Amenity;
        data.id = doc.id;
        return data;
    });
}

// Create a new amenity in the database
export async function create_amenity(
    location: string,
    amenity: Amenity,
): Promise<Amenity> {
    // Set required fields and defaults for creating new amenity
    require_fields(amenity, ["description", "latlong"]);
    default_fields(amenity, { services: [] });

    const parent_location = location_with_id(location);
    const parent_doc = await parent_location.get();
    if (!parent_doc.exists) {
        throw invalid_location(location);
    }

    const created = await parent_doc.ref
        .collection("amenities")
        .add(amenity);

    const doc = await created.get();

    const data = doc.data() as Amenity;
    data.id = doc.id;
    return data;
}

// Update an amenity in the database
export async function update_amenity(
    location: string,
    amenity: string,
    updated: Amenity,
): Promise<Amenity> {
    const doc_ref = location_with_id(location)
        .collection("amenities")
        .doc(amenity);
    await doc_ref.update(updated);

    const doc = await doc_ref.get();
    const data = doc.data() as Amenity;
    data.id = doc.id;
    return data;
}

// Delete an entance from the database
export async function delete_amenity(
    location: string,
    amenity: string,
) {
    await location_with_id(location)
        .collection("amenities")
        .doc(amenity)
        .delete();
}
