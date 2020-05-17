import { Group, GroupItem } from "./groups";
import { Category } from "./events";

export interface User {
    // Unique user identifier
    uid: string;
    // Human-readable name for the user
    name: string;
    // A user's events
    calendar?: Event[];
}

export interface UserGroups {
    groups: GroupItem[];
    subscriptions: GroupItem[];
}

export interface UpdateUser {
    show_first?: Category[];
    show_never?: Category[];
    name?: string;
}