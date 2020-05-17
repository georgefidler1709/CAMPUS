import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";

interface CrossButtonProps {
  onPress: () => void;
  style: any;
  size?: number;
}

export default (props: CrossButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.touchableArea, props.style]}
      onPress={props.onPress}
    >
      <Icon
        type="material"
        name="close"
        color={Colors.PrimaryDarkBlue}
        size={props.size !== undefined ? props.size : 30}
      />
    </TouchableOpacity>
  );
};

const styles = EStyleSheet.create({
  touchableArea: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
});
