export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface Coords {
    latitude: number;
    longitude: number;
}

export interface UpdateLocation {
    name: string;
    latlong: Coords;
    aliases: string[];
    capacity: number;
    bookable: boolean;
}

export interface Location {
    id: string;
    name: string;
    latlong: Coords;
    capacity: number;
    bookable: boolean;
}

export interface Entrance {
    id: string;
    latlong: Coords;
    kind: EntranceKind;
    //Which kind of connection is made by the entrance.
    connection: EntranceConnection;
    /* ID of joined location
    * For child connections this is the ID of one of the children,
    * For sibling connections this is the ID of a child of the parent,
    * For parent connections this is null 
    */
    connected: string
}
  
enum EntranceKind {
    DOOR,
    STAIRWAY,
    ELEVATOR
}
  
  //Ways in which an entrance can connect to another location
enum EntranceConnection {
    //The connection joins a location to its parent
    JOINS_PARENT,
    //The connection joins one of its children
    JOINS_CHILD,
    //The connection joins a child of the parent
    JOINS_SIBLING
}

export interface Amenity {
    //Unique identifier within the location
    id: string;
    description: string;
    latlong: Coords;
  
    /*  Kinds of amenity at the given position
    * Each amenity may offer multiple services and thus have multiple
    * kinds of service
    */
    services: Service[];
}

// Services found at amenities
enum Service {
    BATHROOM,
    MALE_BATHROOM,
    FEMALE_BATHROOM,
    UNISEX_BATHROOM,
    DISABLED_BATHROOM,
    SHOWER,
    KITCHEN,
    COLD_WATER,
    HOT_WATER,
    MICROWAVE,
    WATER_POST,
    BUBBLER,
    BOTTLE_REFILL
}

export enum FocusLocation {
    USER,
    TARGET_LOCATION
};