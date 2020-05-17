import React from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

export default ({ timestamp }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.timestamp}>{timestamp}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    width: "100%",
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 35
  },
  timestamp: {
    color: "$primaryDarkBlue",
    fontSize: 11,
    marginLeft: 15
  },
  line: {
    height: 1,
    width: "87%",
    backgroundColor: "$lightGrey"
  }
});
