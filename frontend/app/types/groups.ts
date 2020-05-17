import { User } from "./user";
import { Event } from "./events";

export interface Group {
    // Unique identifier of the group
    gid: string;
    // Name of the group
    name: string;
    // Description of the group
    description: string;
    // Whether or not the group is publically searchable
    is_public: boolean;
    // Members of the group
    members: User[];
    // subscribers of the group
    subscribers: User[];
    // Events belonging to the group
    calendar: Event[];
}

export interface UpdateGroup {
    name: string;
    description: string;
    is_public: boolean;
}

export interface GroupItem {
    gid: string,
    name: string,
    description: string,
}

export enum GroupStatus {
    MEMBER,
    SUBSCRIBER,
    NONE
}
