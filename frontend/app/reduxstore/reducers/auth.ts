import { SET_UID, SET_SPLASH } from "../actions/auth";

const initialState = {
  uid: null,
  splash: true
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_UID:
      return {
        ...state,
        uid: action.uid
      };
    case SET_SPLASH:
      return {
        ...state,
        splash: action.splash
      };
    default:
      return state;
  }
};

export default reducer;
