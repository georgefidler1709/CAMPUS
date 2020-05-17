import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";

export default ({ onPress, style, iconType, iconName }) => {
  return (
    <TouchableOpacity style={[styles.touchableArea, style]} onPress={onPress}>
      <Icon
        type={iconType}
        name={iconName}
        color={Colors.PrimaryDarkBlue}
        size={33}
      />
    </TouchableOpacity>
  );
};

const styles = EStyleSheet.create({
  touchableArea: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
  },
});
