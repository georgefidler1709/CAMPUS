import { Moment } from "moment";

export const SET_CURRENT_DATE = "SET_CURRENT_DATE";
export const TOGGLE_CALENDAR_OPEN = "TOGGLE_CALENDAR_OPEN";

export const setCurrentDate = (date: Moment) => ({
  type: SET_CURRENT_DATE,
  date,
});

export const toggleCalendarOpen = () => ({
  type: TOGGLE_CALENDAR_OPEN,
});
