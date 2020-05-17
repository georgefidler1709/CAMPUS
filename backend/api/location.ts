// ! Location management API

import { unthunk } from "../api";
import { logger } from "../logger";
import { SearchIndex } from "../search-index";
import { require_test } from "../test";

import * as db from "../database/location";

/// Lazily initialised location search index
let location_index: SearchIndex<string> = null;

export interface Location extends db.Location {
    children: Location[];
    entrances: db.Entrance[];
    amenities: db.Amenity[];
}

interface SingleLocation {
    id: string;
}

interface SearchLocations {
    query: string;
}

interface CreateLocation {
    parent: (string | null);
    location: db.Location;
}

interface UpdateLocation {
    id: string;
    location: db.Location;
}

interface DeleteLocation {
    id: string;
}

interface CreateEntrance {
    location: string;
    entrance: db.Entrance;
}

interface UpdateEntrance {
    location: string;
    id: string;
    entrance: db.Entrance;
}

interface DeleteEntrance {
    location: string;
    id: string;
}

interface CreateAmenity {
    location: string;
    amenity: db.Amenity;
}

interface UpdateAmenity {
    location: string;
    id: string;
    amenity: db.Amenity;
}

interface DeleteAmenity {
    location: string;
    id: string;
}

// Inflate all fields in the location object
function unpack(location: db.Location): Location {
    const result = location as Location;
    result.children = unthunk(() => locations_with_parent(result.id));
    result.entrances = unthunk(() => entrances(result.id));
    result.amenities = unthunk(() => amenities(result.id));
    return result;
}

// Locations with no parent
export async function locations(): Promise<Location[]> {
    return await locations_with_parent(null);
}

// Fetch single location from the database
export async function fetch_location(
    id: string,
): Promise<Location> {
    const root = await db.single_location(id);
    return unpack(root);
}

// Locations with no parent
export async function single_location(
    {id}: SingleLocation,
): Promise<Location> {
    const result = await fetch_location(id);
    return result;
}

// Search for locations with key terms
export async function search_locations(
    {query}: SearchLocations,
): Promise<Location[]> {
    const index = await lazy_index();
    const matches = index.search(query);

    const found = [];

    for (const match of matches) {
        found.push(await fetch_location(match));
    }

    return found;
}

async function locations_with_parent(
    parent: (string | null),
): Promise<Location[]> {
    let found_locations: Location[];
    if (parent !== null) {
        found_locations =
            (await db.locations_with_parent(parent)) as Location[];
    } else {
        found_locations =
            (await db.locations_with_parent(null)) as Location[];
    }

    for (const found_location of found_locations) {
        unpack(found_location);
    }

    return found_locations;
}

async function entrances(
    location: string,
): Promise<db.Entrance[]> {
    return await db.entrances(location);
}

async function amenities(
    location: string,
): Promise<db.Amenity[]> {
    return await db.amenities(location);
}

export async function create_location(
    {parent, location}: CreateLocation,
): Promise<Location> {
    require_test();
    const created = await db.create_location(parent, location);
    const extended = unpack(created);
    // Add location to index
    await index_location(await lazy_index(), extended);
    return extended;
}

export async function update_location(
    {id, location}: UpdateLocation,
): Promise<Location> {
    require_test();
    const created = await db.update_location(id, location);
    const extended = await unpack(created);
    // Add location to index if name or aliases changed
    if (location.name || location.aliases) {
        await index_location(await lazy_index(), extended);
    }
    return extended;
}

export async function delete_location(
    {id}: DeleteLocation,
): Promise<boolean> {
    require_test();

    await db.delete_location(id);

    const index = await lazy_index();
    index.invalidate(id);

    return true;
}

export async function create_entrance(
    {location, entrance}: CreateEntrance,
): Promise<db.Entrance> {
    require_test();
    return await db.create_entrance(location, entrance);
}

export async function update_entrance(
    {location, id, entrance}: UpdateEntrance,
): Promise<db.Entrance> {
    require_test();
    return await db.update_entrance(location, id, entrance);
}

export async function delete_entrance(
    {location, id}: DeleteEntrance,
): Promise<boolean> {
    require_test();
    await db.delete_entrance(location, id);
    return true;
}

export async function create_amenity(
    {location, amenity}: CreateAmenity,
): Promise<db.Amenity> {
    require_test();
    return await db.create_amenity(location, amenity);
}

export async function update_amenity(
    {location, id, amenity}: UpdateAmenity,
): Promise<db.Amenity> {
    require_test();
    return await db.update_amenity(location, id, amenity);
}

export async function delete_amenity(
    {location, id}: DeleteAmenity,
): Promise<boolean> {
    require_test();
    await db.delete_amenity(location, id);
    return true;
}

async function lazy_index(): Promise<SearchIndex<string>> {
    if (location_index === null) {
        location_index = await create_index();
    }

    return location_index;
}

async function create_index(): Promise<SearchIndex<string>> {
    logger.log({
        level: "info",
        message: "Creating location search index",
    });

    /// Create a new search index
    const index: SearchIndex<string> = new SearchIndex();

    /// Add all the locations to the index
    const db_locations = await db.all_locations();
    for (const location of db_locations) {
        await index_location(index, location as Location);
    }

    logger.log({
        level: "info",
        message: "Creating location search index created",
    });

    return index;
}

async function index_location(
    index: SearchIndex<string>,
    location: Location,
) {
    // Invalidate all previous matches
    index.invalidate(location.id);

    // Re-insert into index
    logger.log({
        level: "info",
        message: `Adding ${location.id}: ${location.name}`,
    });
    index.insert(location.name, location.id);
    for (const alias of location.aliases) {
        logger.log({
            level: "info",
            message: `Adding ${location.id}: ${alias}`,
        });
        index.insert(alias, location.id);
    }
}
