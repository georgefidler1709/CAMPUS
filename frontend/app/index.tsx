import React from "react";
import { StatusBar, YellowBox } from "react-native";
import RootStackNavigator from "./navigation/RootStackNavigator";
import EStyleSheet from "react-native-extended-stylesheet";
import { NavigationContainer } from "@react-navigation/native";
import { Colors } from "./constants";
import * as firebase from "firebase/app";
import { firebase_options } from "./constants/Firebase";
import { Provider } from "react-redux";
import store from "./store";

EStyleSheet.build({
  $primaryDarkBlue: Colors.PrimaryDarkBlue,
  $primaryLightBlue: Colors.PrimaryLightBlue,
  $nonTintedTab: Colors.NonTintedTab,
  $lightGrey: Colors.LightGrey,
  $darkGrey: Colors.DarkGrey,
  $white: Colors.White,
  $purple: Colors.Purple,
  $red: Colors.Red,
  $green: Colors.Green,
});

if (!firebase.apps.length) {
  firebase.initializeApp(firebase_options);
}

YellowBox.ignoreWarnings([
  "Can't perform a React state update on an unmounted component.",
]);

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <RootStackNavigator />
      </NavigationContainer>
    </Provider>
  );
}
