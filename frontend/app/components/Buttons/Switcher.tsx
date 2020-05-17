import * as React from "react";
import { View, Text, Switch } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

interface SwitcherProps {
  label: string;
  onToggleSwitch: () => void;
  value: boolean;
}

export default (props: SwitcherProps) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.label}</Text>
    <Switch onValueChange={props.onToggleSwitch} value={props.value} />
  </View>
);

const styles = EStyleSheet.create({
  container: {
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  text: {
    color: "$primaryDarkBlue",
    fontWeight: "500",
  },
});
