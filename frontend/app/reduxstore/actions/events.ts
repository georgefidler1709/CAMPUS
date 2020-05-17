import { Event, EventFilter } from "../../types/events";

export const SET_CALENDAR_EVENTS = "SET_CALENDAR_EVENTS";
export const SET_PUBLIC_EVENTS = "SET_PUBLIC_EVENTS";
export const SET_PUBLIC_EVENTS_FILTER = "SET_PUBLIC_EVENTS_FILTER";
export const CLEAR_PUBLIC_EVENTS_FILTER = "CLEAR_PUBLIC_EVENTS_FILTER";

export const setCalendarEvents = (events: Event[]) => ({
  type: SET_CALENDAR_EVENTS,
  events,
});

export const setPublicEvents = (events: Event[]) => ({
  type: SET_PUBLIC_EVENTS,
  events,
});

export const setPublicEventsFilter = (
  filter: EventFilter,
  locationName: string
) => ({
  type: SET_PUBLIC_EVENTS_FILTER,
  filter,
  locationName,
});

export const clearPublicEventsFilter = () => ({
  type: CLEAR_PUBLIC_EVENTS_FILTER,
});
