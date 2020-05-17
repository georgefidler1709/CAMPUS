import * as React from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

export default ({ leftButton, rightButton, title }) => {
  return (
    <View style={styles.header}>
      {leftButton}
      <Text style={styles.screenTitle}> {title} </Text>
      {rightButton}
    </View>
  );
};

const styles = EStyleSheet.create({
  header: {
    width: "100%",
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  screenTitle: {
    color: "$primaryDarkBlue",
    fontSize: 22,
    fontWeight: "500"
  }
});
