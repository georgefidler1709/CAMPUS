import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Events from "../screens/Events/Events";
import EventDetails from "../screens/Events/EventDetails";
import GenericHeader from "../components/Headers/GenericHeader";
import { HeaderButton } from "../components/Buttons";
import InviteUsers from "../screens/Events/InviteUsers";

const MainStack = createStackNavigator();

const headerStyle = { height: 120 };

function EventsStackNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Events" headerMode="screen">
      <MainStack.Screen
        name="Events"
        component={Events}
        options={{
          headerStyle: headerStyle,
          header: ({ scene, previous, navigation }) => {
            const { options } = scene.descriptor;
            const title =
              options.title !== undefined ? options.title : scene.route.name;

            return (
              <GenericHeader
                style={options.headerStyle}
                leftElement={title}
                rightElement={
                  <HeaderButton
                    onPress={() =>
                      navigation.navigate("AddEvent", { mode: "create" })
                    }
                    style={{ marginRight: 15 }}
                    iconType="material-community"
                    iconName="plus"
                  />
                }
              />
            );
          },
        }}
      />
      <MainStack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          headerStyle: headerStyle,
        }}
      />
    </MainStack.Navigator>
  );
}

export default EventsStackNavigator;
