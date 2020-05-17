import { SET_FOCUS, SET_TARGET_LOCATION, SET_SEARCH_QUERY, SET_USER_COORDS, SET_IS_DIRECTING } from "../actions/location";
import { FocusLocation } from "../../types/location";

const initialState = {
    focus: FocusLocation.USER,
    targetLocation: null,
    searchQuery: "",
    userCoords: null,
    isDirecting: false
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_FOCUS:
      return {
        ...state,
        focus: action.focus
      };
    case SET_TARGET_LOCATION:
      return {
        ...state,
        targetLocation: action.targetLocation
      };
    case SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.searchQuery
      };
    case SET_USER_COORDS:
      return {
        ...state,
        userCoords: action.userCoords
        };
    case SET_IS_DIRECTING:
      return {
        ...state,
        isDirecting: action.isDirecting
        };
    default:
      return state;
  }
};

export default reducer;
