import { combineReducers } from "redux";

import auth from "./auth";
import events from "./events";
import calendar from "./calendar";
import location from "./location";
import groups from "./groups";
import users from "./users";

export default combineReducers({
  auth,
  events,
  calendar,
  location,
  groups,
  users,
});
