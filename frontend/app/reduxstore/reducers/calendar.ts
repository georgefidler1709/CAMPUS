import moment from "moment";
import { SET_CURRENT_DATE, TOGGLE_CALENDAR_OPEN } from "../actions/calendar";

const initialState = {
  currentDate: moment(),
  calendarOpen: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_DATE:
      return {
        ...state,
        currentDate: action.date,
      };
    case TOGGLE_CALENDAR_OPEN:
      return {
        ...state,
        calendarOpen: !state.calendarOpen,
      };
    default:
      return state;
  }
};

export default reducer;
