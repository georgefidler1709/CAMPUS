export const SET_UID = "SET_UID";
export const SET_SPLASH = "SET_SPLASH";

export const setUid = (uid: string) => ({
  type: SET_UID,
  uid
});

export const setSplash = (checking: boolean) => ({
  type: SET_SPLASH,
  checking
});
