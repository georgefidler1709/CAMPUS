import _ from "lodash";
import { InviteResponse, Event } from "../../types/events";
import {
  SET_CALENDAR_EVENTS,
  SET_PUBLIC_EVENTS,
  SET_PUBLIC_EVENTS_FILTER,
  CLEAR_PUBLIC_EVENTS_FILTER,
} from "../actions/events";

const initialState = {
  newEvent: {},
  calendarEvents: [],
  numInvites: 0,
  publicEvents: [],
  publicEventsFilter: {
    location: null,
    happening_now: false,
    categories: [],
  },
  publicEventsFilterLocationName: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CALENDAR_EVENTS:
      const events: Event[] = action.events;
      let numInvites = 0;
      _.forEach(events, (event) => {
        if (
          event.user_rsvp &&
          event.user_rsvp.response === InviteResponse.INVITED
        ) {
          numInvites++;
        }
      });
      return {
        ...state,
        calendarEvents: events,
        numInvites,
      };
    case SET_PUBLIC_EVENTS:
      return {
        ...state,
        publicEvents: action.events,
      };
    case SET_PUBLIC_EVENTS_FILTER:
      return {
        ...state,
        publicEventsFilter: action.filter,
        publicEventsFilterLocationName: action.locationName,
      };
    case CLEAR_PUBLIC_EVENTS_FILTER:
      return {
        ...state,
        publicEventsFilter: {
          location: null,
          happening_now: false,
          categories: [],
        },
        publicEventsFilterLocationName: "",
      };
    default:
      return state;
  }
};

export default reducer;
