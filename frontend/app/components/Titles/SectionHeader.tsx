import * as React from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

interface SectionHeaderProps {
  title: string;
  color: string;
}

export default (props: SectionHeaderProps) => {
  return (
    <View style={[styles.container, { backgroundColor: props.color }]}>
      <Text style={styles.titleStyle}>{props.title}</Text>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  titleStyle: {
    color: "$white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 13,
  },
});
