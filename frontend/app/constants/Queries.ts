export const API_URL = "https://campus-app.xyz/api";

export const CREATE_USER = `
mutation Create($user: UpdateUser!) {
    create_user(user: $user) {
    	name,
    	uid
    }
}
`;

export const SEARCH_USERS = `
query SearchUsers($query: String!) {
    search_users(query: $query) {
        name,
        uid
    }
}
`;

export const CREATE_LOCATION = `
mutation CreateLocation($location: UpdateLocation!) {
    create_location(location: $location) {
        id
    }
}
`;

export const GET_LOCATIONS = `
query Locations {
    locations {
        id,
        name,
        capacity,
        latlong {
            latitude,
            longitude
        }
    }
}
`;
export const SEARCH_LOCATIONS = `
query SearchLocation($query: String!) {
    search_locations(query: $query) {
        id,
        name,
        capacity,
        latlong {
            latitude,
            longitude
        }
    }
  }
`;

export const CREATE_EVENT = `
mutation CreateEvent($event: UpdateEvent!) {
    create_event(event_info: $event) {
        eid
    }
}
`;

export const INVITE_TO_EVENT = `
mutation InviteToEvent($event: ID!, $guest: ID!) {
    invite(event: $event, guest: $guest) {
        response
    }
}
`;

export const GET_EVENT = `
query GetEvent($eid: ID!) {
    event(eid: $eid) {
        eid,
        name,
        start_time,
        end_time,
        description,
        location {
            id,
            name,
            capacity,
            latlong {
                latitude,
                longitude
            }
        },
        public_event,
        capacity,
        remaining_capacity,
        can_edit,
        categories,
        rsvps {
            response,
            guest {
                name,
                uid
            }
        },
        user_rsvp {
            response
        }
    }
}
`;

export const GET_PUBLIC_EVENTS = `
query GetPublicEvents($filter: EventFilter!) {
    all_public_events(filter: $filter) {
        eid,
        name,
        start_time,
        end_time,
        description,
        location {
            id,
            name,
            capacity,
            latlong {
                latitude,
                longitude
            }
        },
        public_event,
        capacity,
        can_edit,
        categories,
        rsvps {
            response,
            guest {
                name,
                uid
            }
        },
        user_rsvp {
            response
        },
        remaining_capacity
    }
}
`;

export const GET_OWNED_EVENTS = `
query GetOwnedEvents {
    all_owned_events {
        eid,
        name,
        start_time,
        end_time,
        description,
        location {
            id,
            name,
            capacity,
            latlong {
                latitude,
                longitude
            }
        },
        public_event,
        capacity,
        remaining_capacity,
        can_edit
    }
}
`;

export const GET_CALENDAR_EVENTS = `
    query User {
        user {
            uid,
            name,
            calendar {
                eid,
                name,
                start_time,
                end_time,
                description,
                location {
                    id,
                    name,
                    capacity,
                    latlong {
                        latitude,
                        longitude
                    }
                },
                categories,
                public_event,
                capacity,
                remaining_capacity,
                can_edit,
                rsvps {
                    response,
                    guest {
                        name,
                        uid
                    }
                },
                user_rsvp {
                    response
                }
            }
        }
    }
`;

export const UPDATE_EVENT = `
mutation UpdateEvent($eid: ID!, $event: UpdateEvent!) {
    update_event(eid: $eid, event_info: $event) {
        eid
    }
}
`;

export const DELETE_EVENT = `
mutation DeleteEvent($eid: ID!) {
    delete_event(eid: $eid)
}
`;

export const RESPOND_TO_EVENT = `
mutation RespondToEvent($event: ID!, $response: InviteResponse!) {
    respond(event: $event, response: $response) {
        response
    }
}
`;

export const GET_USER_PREFERENCES = `
query GetUserPreference {
    user {
        show_first,
        show_never
    }
}
`;

export const UPDATE_USER = `
mutation UpdateUser($updated: UpdateUser!) {
    update_user(updated: $updated) {
        uid
    }
}
`;

export const SEARCH_EVENTS = `
query SearchPublicEvents($query: String!) {
    search_events(query: $query) {
       eid,
       name
    }
}
`;

export const GET_USER_ID = `
query UserGroups {
    user {
       uid
    }
}
`;

export const GET_USER_GROUPS = `
query UserGroups {
    user {
        groups {
            gid, 
            name,
            description
        },
        subscriptions {
            gid, 
            name,
            description
        }
    }
}
`;

export const SUBSCRIBE_TO_GROUP = `
mutation SubscribeToGroup($gid: ID!) {
    subscribe_to_group(gid: $gid) {
        gid
    }
}   
`;

export const UNSUBSCRIBE_FROM_GROUP = `
mutation UnsubscribeFromGroup($gid: ID!) {
    unsubscribe_from_group(gid: $gid) {
        gid
    }
}   
`;

export const CREATE_GROUP = `
mutation CreateGroup($group: UpdateGroup!) {
    create_group(group: $group) {
        gid,
        name,
        description
    }
}
`;

export const DELETE_GROUP = `
mutation DeleteGroup($gid: ID!) {
    delete_group(gid: $gid)
}
`;

export const ADD_GROUP_MEMBER = `
mutation AddGroupMember($gid: ID!, $user: ID!) {
    add_group_member(gid: $gid, user: $user) {
        gid
    }
}
`;

export const REMOVE_GROUP_MEMBER = `
mutation RemoveGroupMember($gid: ID!, $user: ID!) {
    remove_group_member(gid: $gid, user: $user) {
        gid
    }
}
`;

export const SEARCH_PUBLIC_GROUPS = `
query SearchPublicGroups($query: String!) {
    search_public_groups(query: $query) {
        gid, 
        name,
        description
    }
}
`;

export const GET_GROUP = `
query GetGroup($gid: ID!) {
    group(gid: $gid) {
        gid, 
        name,
        description,
        is_public,
        members {
            uid,
            name
        },
        subscribers {
            uid,
            name
        },
        calendar {
            eid,
            name,
            start_time,
            end_time,
            description,
            location {
                id,
                name,
                capacity,
                latlong {
                    latitude,
                    longitude
                }
            },
            categories,
            public_event,
            capacity,
            remaining_capacity,
            can_edit,
            rsvps {
                response,
                guest {
                    name,
                    uid
                }
            },
            user_rsvp {
                response
            }
        }
    }
}
`;
export const UPDATE_GROUP = `
mutation UpdateGroup($gid: ID!, $group: UpdateGroup!) {
    update_group(gid: $gid, group: $group) {
        gid
    }
}
`;
export const CREATE_GROUP_EVENT = `
mutation CreateGroupEvent($owner: ID!, $event_info: UpdateEvent!) {
    create_group_event(owner: $owner, event_info: $event_info) {
        eid
    }
}
`;

export const DELETE_USER = `
    mutation DeleteUser {
        delete_user
    }
`;
