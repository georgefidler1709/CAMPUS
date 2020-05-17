import * as React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";

export default ({ onPress, active, containerStyle = {}, text, textSize }) => {
  if (active) {
    return (
      <TouchableOpacity
        style={[styles.touchableArea, containerStyle]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.activeText,
            { fontSize: textSize, padding: textSize / 2 }
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  } else {
    return (
      <View style={[styles.touchableArea, containerStyle]}>
        <Text
          style={[
            styles.inactiveText,
            { fontSize: textSize, padding: textSize / 2 }
          ]}
        >
          {text}
        </Text>
      </View>
    );
  }
};

const styles = EStyleSheet.create({
  touchableArea: {
    justifyContent: "center",
    alignItems: "center"
  },
  activeText: {
    color: Colors.PrimaryLightBlue,
    fontWeight: "500"
  },
  inactiveText: {
    color: Colors.NonTintedTab + "70",
    fontWeight: "500"
  }
});
