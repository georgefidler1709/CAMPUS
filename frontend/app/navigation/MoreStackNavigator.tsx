import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import More from "../screens/More/More";
import GenericHeader from "../components/Headers/GenericHeader";

const MainStack = createStackNavigator();

function MoreStackNavigator() {
  return (
    <MainStack.Navigator initialRouteName="More" headerMode="screen">
      <MainStack.Screen
        name="More"
        component={More}
        options={{
          headerStyle: {
            height: 120,
          },
          header: ({ scene, previous, navigation }) => {
            const { options } = scene.descriptor;
            const title =
              options.title !== undefined ? options.title : scene.route.name;

            return (
              <GenericHeader leftElement={title} style={options.headerStyle} />
            );
          },
        }}
      />
    </MainStack.Navigator>
  );
}

export default MoreStackNavigator;
