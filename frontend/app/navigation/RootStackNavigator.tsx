import * as React from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import { View, Text, Button } from "react-native";
import { connect } from "react-redux";
import { setUid, setSplash } from "../reduxstore/actions/auth";
import * as firebase from "firebase/app";
import "firebase/auth";

import RootTabNavigator from "./RootTabNavigator";
import Login from "../screens/Authentication/Login";
import ModalScreen from "../screens/Modal/ModalScreen";
import SearchModal from "../screens/Modal/SearchModal";
import ListModal from "../screens/Modal/ListModal";
import AddEvent from "../screens/Events/AddEvent";
import AddGroup from "../screens/Groups/AddGroup";
import SplashScreen from "../screens/Authentication/SplashScreen";
import SetPreferences from "../screens/More/SetPreferences";
import InviteUsers from "../screens/Events/InviteUsers";

const Stack = createStackNavigator();

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

function RootStackNavigator({ uid, splash, setUid, setSplash }) {
  // // code to log out
  // firebase
  //   .auth()
  //   .signOut()
  //   .then(() => {})
  //   .catch((error) => {
  //     // An error happened.
  //   });

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      // User is signed in.
      setUid(user.uid);
    } else {
      setUid(null);
    }
    setSplash(false);
  });

  if (splash) {
    return <SplashScreen />;
  }
  return (
    <Stack.Navigator headerMode="none" mode="modal">
      {uid === null ? (
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            cardStyleInterpolator: forFade,
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainApp"
            component={RootTabNavigator}
            options={{
              cardStyleInterpolator: forFade,
            }}
          />
          <Stack.Screen name="AddEvent" component={AddEvent} />
          <Stack.Screen name="AddGroup" component={AddGroup} />
          <Stack.Screen name="Modal" component={ModalScreen} />
          <Stack.Screen name="SearchModal" component={SearchModal} />
          <Stack.Screen name="ListModal" component={ListModal} />
          <Stack.Screen name="SetPreferences" component={SetPreferences} />
          <Stack.Screen name="InviteUsers" component={InviteUsers} />
        </>
      )}
    </Stack.Navigator>
  );
}

const RootStackNavigatorContainer = connect(
  (state) => ({
    uid: state.auth.uid,
    splash: state.auth.splash,
  }),
  { setUid, setSplash }
)(RootStackNavigator);

export default RootStackNavigatorContainer;
