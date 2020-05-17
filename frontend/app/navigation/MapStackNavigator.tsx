import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LocationModal from "../screens/Modal/LocationModal";
import Map from "../screens/Map/MapScreen";
import EventDetails from "../screens/Events/EventDetails";

const MainStack = createStackNavigator();

function MapStackNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Map" headerMode="screen">
      <MainStack.Screen name="Map" component={Map} />
      <MainStack.Screen name="LocationModal" component={LocationModal} />
      <MainStack.Screen name="EventDetails" component={EventDetails} />
    </MainStack.Navigator>
  );
}

export default MapStackNavigator;
