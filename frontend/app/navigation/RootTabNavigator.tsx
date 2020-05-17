import * as React from "react";
import { Icon, Badge } from "react-native-elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { connect } from "react-redux";

import CalendarStackNavigator from "./CalendarStackNavigator";
import GroupsStackNavigator from "./GroupsStackNavigator";
import EventsStackNavigator from "./EventsStackNavigator";
import MoreStackNavigator from "./MoreStackNavigator";
import MapStackNavigator from "./MapStackNavigator";
import { Colors } from "../constants";
import { View } from "react-native";

const Tab = createBottomTabNavigator();

function RootTabNavigator({ numInvites }) {
  return (
    <Tab.Navigator
      initialRouteName="Calendar"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string, typeName: string;

          if (route.name !== "MoreStackNavigator") {
            switch (route.name) {
              case "CalendarStackNavigator":
                typeName = "material-community";
                iconName = "calendar-range";
                break;
              case "MapStackNavigator":
                typeName = "font-awesome";
                iconName = "map";
                size = 20;
                break;
              case "EventsStackNavigator":
                typeName = "material";
                iconName = "location-on";
                break;
              case "GroupsStackNavigator":
                typeName = "material";
                iconName = "people";
                break;
            }

            return (
              <Icon name={iconName} type={typeName} size={size} color={color} />
            );
          } else {
            typeName = "material-community";
            iconName = "menu";

            return (
              <View>
                <Icon
                  name={iconName}
                  type={typeName}
                  size={size}
                  color={color}
                />
                {numInvites > 0 && (
                  <Badge
                    status="error"
                    containerStyle={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                    }}
                  />
                )}
              </View>
            );
          }
        },
      })}
      tabBarOptions={{
        activeTintColor: Colors.PrimaryLightBlue,
        inactiveTintColor: Colors.NonTintedTab,
      }}
    >
      <Tab.Screen
        name="CalendarStackNavigator"
        component={CalendarStackNavigator}
        options={{ title: "Calendar" }}
      />
      <Tab.Screen
        name="MapStackNavigator"
        component={MapStackNavigator}
        options={{ title: "Map" }}
      />
      <Tab.Screen
        name="EventsStackNavigator"
        component={EventsStackNavigator}
        options={{ title: "Events" }}
      />
      <Tab.Screen
        name="GroupsStackNavigator"
        component={GroupsStackNavigator}
        options={{ title: "Groups" }}
      />
      <Tab.Screen
        name="MoreStackNavigator"
        component={MoreStackNavigator}
        options={{ title: "More" }}
      />
    </Tab.Navigator>
  );
}

const RootTabNavigatorContainer = connect((state) => ({
  numInvites: state.events.numInvites,
}))(RootTabNavigator);

export default RootTabNavigatorContainer;
