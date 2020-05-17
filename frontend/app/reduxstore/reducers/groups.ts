import { ADD_NEW_MEMBER_GROUP, ADD_NEW_SUBSCRIBER_GROUP, SET_GROUPS, LEAVE_GROUP, UNSUBSCRIBE, SET_SEARCH_QUERY } from "../actions/groups";
import { UserGroups } from "../../types/user";

const initialState = {
  searchQuery: "",
  groups: {
    groups: [],
    subscriptions: []
  } as UserGroups
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_GROUPS:
      return {
        ...state,
        groups: action.groups,
      };
    case ADD_NEW_MEMBER_GROUP:
      return {
        ...state,
        groups: {...state.groups,
          member: [...state.groups.groups, action.newGroup]
        },
      };
    case ADD_NEW_SUBSCRIBER_GROUP:
      return {
        ...state,
        groups: {...state.groups,
          subscription: [...state.groups.subscriptions, action.newGroup]
        },
      };
    case LEAVE_GROUP:
      return {
        ...state,
        groups: {...state.groups,
          member: state.groups.groups.filter((_, i) => i !== action.removeIdx)
        }
      };
    case UNSUBSCRIBE:
      return {
          ...state,
          groups: {...state.groups,
          subscription: state.groups.subscriptions.filter((_, i) => i !== action.removeIdx)
        }
      };
    case SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.searchQuery
      }; 
    default:
      return state;
  }
};

export default reducer;
