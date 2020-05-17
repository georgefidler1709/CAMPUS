import { FocusLocation, Coords } from "../../types/location";
import { Location } from '../../types/location';

export const SET_FOCUS = "SET_FOCUS";
export const SET_TARGET_LOCATION = "SET_TARGET_LOCATION";
export const SET_SEARCH_QUERY = "SET_SEARCH_QUERY";
export const SET_USER_COORDS = "SET_USER_COORDS";
export const SET_IS_DIRECTING = "SET_IS_DIRECTING";

export const setFocus = (focus: FocusLocation) => ({
  type: SET_FOCUS,
  focus
});

export const setTargetLocation = (targetLocation: Location) => ({
  type: SET_TARGET_LOCATION,
  targetLocation
});

export const setSearchQuery = (searchQuery: string) => ({
  type: SET_SEARCH_QUERY,
  searchQuery
});

export const setUserCoords = (userCoords: Coords) => ({
  type: SET_USER_COORDS,
  userCoords
});

export const setIsDirecting = (isDirecting: Coords) => ({
  type: SET_IS_DIRECTING,
  isDirecting
});