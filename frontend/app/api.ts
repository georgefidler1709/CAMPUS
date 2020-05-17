import * as firebase from "firebase/app";
import {
  API_URL,
  CREATE_USER,
  CREATE_LOCATION,
  GET_LOCATIONS,
  SEARCH_LOCATIONS,
  CREATE_EVENT,
  GET_PUBLIC_EVENTS,
  UPDATE_EVENT,
  DELETE_EVENT,
  SUBSCRIBE_TO_GROUP,
  CREATE_GROUP,
  UNSUBSCRIBE_FROM_GROUP,
  SEARCH_PUBLIC_GROUPS,
  ADD_GROUP_MEMBER,
  REMOVE_GROUP_MEMBER,
  DELETE_GROUP,
  GET_USER_GROUPS,
  GET_USER_ID,
  GET_GROUP,
  SEARCH_USERS,
  UPDATE_GROUP,
  GET_OWNED_EVENTS,
  GET_CALENDAR_EVENTS,
  GET_USER_PREFERENCES,
  UPDATE_USER,
  CREATE_GROUP_EVENT,
  GET_EVENT,
  SEARCH_EVENTS,
  DELETE_USER,
  RESPOND_TO_EVENT,
  INVITE_TO_EVENT,
} from "./constants/Queries";
import { firebase_options } from "./constants/Firebase";
import { UpdateLocation } from "./types/location";
import { Location } from "./types/location";
import {
  Event,
  UpdateEvent,
  EventFilter,
  EventSearchItem,
  InviteResponse,
} from "./types/events";
import { Group, UpdateGroup, GroupItem } from "./types/groups";
import { UserGroups, User, UpdateUser } from "./types/user";
import _ from "lodash";

function getUserToken(): Promise<string> {
  return firebase.auth().currentUser!.getIdToken();
}

function createDefaultHeaders(auth_token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${auth_token}`,
  };
}

export function createUser(user: UpdateUser) {
  getUserToken().then((token) => {
    fetch(API_URL, {
      method: "POST",
      headers: createDefaultHeaders(token),
      body: JSON.stringify({
        query: CREATE_USER,
        variables: { user: user },
      }),
    });
  });
}

export async function searchUsers(query: string): Promise<User[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: SEARCH_USERS,
      variables: { query: query },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.search_users;
    });
}

export async function searchLocations(query: string): Promise<Location[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: SEARCH_LOCATIONS,
      variables: { query: query },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.search_locations;
    });
}

export async function collectLocations(): Promise<Location[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_LOCATIONS,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.locations;
    });
}

export async function getUserId(): Promise<string> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_USER_ID,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.uid;
    });
}

export async function createEvent(event: UpdateEvent): Promise<string> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: CREATE_EVENT,
      variables: {
        event: event,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.eid;
    });
}

export async function getEvent(eid: string): Promise<Event> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_EVENT,
      variables: { eid: eid },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.event;
    });
}

export async function collectPublicEvents(
  filter: EventFilter
): Promise<Event[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_PUBLIC_EVENTS,
      variables: { filter: filter },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.all_public_events;
    });
}

export async function collectOwnedEvents(): Promise<Event[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_OWNED_EVENTS,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.all_owned_events;
    });
}

export async function collectCalendarEvents(): Promise<Event[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_CALENDAR_EVENTS,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      //if (r.errors) console.log(r);
      return r.data.user.calendar;
    })
    .catch((err) => {
      return [];
    });
}

export async function collectInvites(): Promise<Event[]> {
  const events = await collectCalendarEvents();
  const invitedEvents = _.filter(events, (event) => {
    if (event.user_rsvp) {
      return event.user_rsvp.response === InviteResponse.INVITED;
    }
    return false;
  });
  return invitedEvents;
}

export async function inviteToEvent(
  eid: string,
  uid: string
): Promise<InviteResponse> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: INVITE_TO_EVENT,
      variables: {
        event: eid,
        guest: uid,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.invite.response;
    });
}

export async function updateEvent(
  eid: string,
  event: UpdateEvent
): Promise<string> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: UPDATE_EVENT,
      variables: {
        eid: eid,
        event: event,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.eid;
    });
}

export async function deleteEvent(eid: string): Promise<boolean> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: DELETE_EVENT,
      variables: {
        eid: eid,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.delete_location;
    });
}

export async function respondToEvent(
  eventId: string,
  response: InviteResponse
): Promise<InviteResponse> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: RESPOND_TO_EVENT,
      variables: {
        event: eventId,
        response: response,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.respond.response;
    });
}

export async function searchPublicEvents(
  query: string
): Promise<EventSearchItem[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: SEARCH_EVENTS,
      variables: {
        query: query,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.search_events;
    });
}

export async function collectUserGroups(): Promise<UserGroups> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_USER_GROUPS,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.user;
    });
}

export async function searchPublicGroups(query: string): Promise<GroupItem[]> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: SEARCH_PUBLIC_GROUPS,
      variables: {
        query: query,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.search_public_groups;
    });
}

export async function addGroupMember(gid: string, user: string) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: ADD_GROUP_MEMBER,
      variables: {
        gid: gid,
        user: user,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}
export async function removeGroupMember(gid: string, user: string) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: REMOVE_GROUP_MEMBER,
      variables: {
        gid: gid,
        user: user,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function subscribeToGroup(gid: string) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: SUBSCRIBE_TO_GROUP,
      variables: { gid: gid },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function unsubscribeFromGroup(gid: string) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: UNSUBSCRIBE_FROM_GROUP,
      variables: { gid: gid },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function createGroup(group: UpdateGroup) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: CREATE_GROUP,
      variables: { group: group },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function deleteGroup(gid: string) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: DELETE_GROUP,
      variables: { gid: gid },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function getGroup(gid: string): Promise<Group> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_GROUP,
      variables: { gid: gid },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return r.data.group;
    });
}

export async function updateGroup(gid: string, group: UpdateGroup) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: UPDATE_GROUP,
      variables: {
        gid: gid,
        group: group,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function collectOnGoingEvents(): Promise<Event[]> {
  const filter = {
    happening_now: true,
    location: null,
    categories: [],
  };
  return collectPublicEvents(filter);
}

export async function getUserPreferences(): Promise<any> {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: GET_USER_PREFERENCES,
      variables: {},
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
      return {
        showFirst: r.data.user.show_first,
        showNever: r.data.user.show_never,
      };
    });
}

export async function updateUser(updated: UpdateUser) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: UPDATE_USER,
      variables: {
        updated: updated,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function createGroupEvent(owner: string, event_info: UpdateEvent) {
  const token = await getUserToken();
  fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: CREATE_GROUP_EVENT,
      variables: {
        owner: owner,
        event_info: event_info,
      },
    }),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.errors) console.log(r);
    });
}

export async function deleteUser() {
  const token = await getUserToken();
  return fetch(API_URL, {
    method: "POST",
    headers: createDefaultHeaders(token),
    body: JSON.stringify({
      query: DELETE_USER,
      variables: {},
    }),
  }).then((r) => r.json());
}
