import * as React from "react";
import { TouchableHighlight, View, Text } from "react-native";
import { Icon } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";

interface TopListButton {
  onPress: () => void;
  text: string;
  style: any;
  iconType: string;
  iconName: string;
}

export default (props: TopListButton) => {
  return (
    <TouchableHighlight
      style={[styles.touchableArea, props.style]}
      onPress={props.onPress}
      underlayColor="#EEE"
    >
      <View style={styles.container}>
        <Icon
          type={props.iconType}
          name={props.iconName}
          color={Colors.DarkGrey}
        />
        <Text style={styles.textStyle}>{props.text}</Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = EStyleSheet.create({
  touchableArea: {
    flex: 1,
    borderRadius: 5,
    margin: 3,
    backgroundColor: "$white",
    shadowColor: "#000",
    shadowOffset: { height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  textStyle: {
    marginLeft: 7,
    color: "$darkGrey",
    fontSize: 16,
  },
});
