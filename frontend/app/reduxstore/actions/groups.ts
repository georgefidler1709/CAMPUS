import { Group } from "../../types/groups";
import { UserGroups } from "../../types/user";

export const ADD_NEW_MEMBER_GROUP = "ADD_NEW_MEMBER_GROUP";
export const ADD_NEW_SUBSCRIBER_GROUP = "ADD_NEW_SUBSCRIBER_GROUP";
export const SET_GROUPS = "SET_GROUPS";
export const LEAVE_GROUP = "LEAVE_GROUP";
export const UNSUBSCRIBE = "UNSUBSCRIBE";
export const SET_SEARCH_QUERY = "SET_SEARCH_QUERY";

export const addNewMemberGroup = (newGroup: Group) => ({
  type: ADD_NEW_MEMBER_GROUP,
  newGroup,
});

export const addNewSubscriberGroup = (newGroup: Group) => ({
  type: ADD_NEW_MEMBER_GROUP,
  newGroup,
});

export const leaveGroup = (removeIdx: number) => ({
  type: LEAVE_GROUP,
  removeIdx,
});

export const unsubscribe = (removeIdx: number) => ({
  type: UNSUBSCRIBE,
  removeIdx,
});

export const setGroups = (groups: UserGroups) => ({
  type: SET_GROUPS,
  groups,
});

export const setSearchQuery = (searchQuery: string) => ({
  type: SET_SEARCH_QUERY,
  searchQuery
});
