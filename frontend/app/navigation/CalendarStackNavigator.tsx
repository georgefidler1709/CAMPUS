import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Calendar from "../screens/Calendar/Calendar";
import CalendarHeader from "../components/Headers/CalendarHeader";
import GenericHeader from "../components/Headers/GenericHeader";
import EventDetails from "../screens/Events/EventDetails";
import InviteUsers from "../screens/Events/InviteUsers";
import { HeaderButton } from "../components/Buttons";

const headerStyle = { height: 120 };

const MainStack = createStackNavigator();

function CalendarStackNavigator({ navigation }) {
  return (
    <MainStack.Navigator initialRouteName="Calendar" headerMode="screen">
      <MainStack.Screen
        name="Calendar"
        component={Calendar}
        options={{
          headerStyle: headerStyle,
          header: ({ scene, navigation }) => {
            const { options } = scene.descriptor;
            const title =
              options.title !== undefined ? options.title : scene.route.name;

            return (
              <CalendarHeader
                title={title}
                onPressPlus={() =>
                  navigation.navigate("AddEvent", { mode: "create" })
                }
                style={options.headerStyle}
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

export default CalendarStackNavigator;
