import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Groups from "../screens/Groups/Groups";
import GenericHeader from "../components/Headers/GenericHeader";
import { HeaderButton } from "../components/Buttons";
import GroupDetails from "../screens/Groups/GroupDetails";
import AddGroupEvent from "../screens/Groups/AddGroupEvent";
import EventDetails from "../screens/Events/EventDetails";
import InviteUsers from "../screens/Events/InviteUsers";

const headerStyle = { height: 120 };

const MainStack = createStackNavigator();

function GroupsStackNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Groups" headerMode="screen">
      <MainStack.Screen
        name="Groups"
        component={Groups}
        options={{
          headerStyle: {
            height: 120,
          },
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
                    onPress={() => {
                      navigation.navigate("AddGroup", { mode: "create" });
                    }}
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
        name="GroupDetails"
        component={GroupDetails}
        options={{
          headerStyle: headerStyle,
        }}
      />
      <MainStack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          headerStyle: headerStyle,
        }}
      />
      <MainStack.Screen
        name="AddGroupEvent"
        component={AddGroupEvent}
        options={{
          headerStyle: headerStyle,
        }}
      />
    </MainStack.Navigator>
  );
}

export default GroupsStackNavigator;
