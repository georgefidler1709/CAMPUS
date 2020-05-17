import * as React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Input, Icon } from "react-native-elements";
import { Colors } from "../../constants";
import EStyleSheet from "react-native-extended-stylesheet";

interface DetailsButtonProps {
  iconType: string;
  iconName: string;
  placeholderText: string;
  value: string | string[] | undefined;
  onPress: () => void;
}

export default (props: DetailsButtonProps) => {
  if (!props.value) {
    return (
      <TouchableOpacity style={styles.touchableArea} onPress={props.onPress}>
        <View style={styles.container}>
          <Icon
            type={props.iconType}
            name={props.iconName}
            color={Colors.PrimaryDarkBlue}
            size={24}
            iconStyle={{ marginLeft: 10 }}
          />
          <Text style={styles.textStyleGrey}>{props.placeholderText}</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (!Array.isArray(props.value)) {
    return (
      <TouchableOpacity style={styles.touchableArea} onPress={props.onPress}>
        <View style={styles.container}>
          <Icon
            type={props.iconType}
            name={props.iconName}
            color={Colors.PrimaryDarkBlue}
            size={24}
            iconStyle={{ marginLeft: 10 }}
          />
          <Text style={styles.textStyleBlue}>{props.value}</Text>
        </View>
      </TouchableOpacity>
    );
  } else {
    if (props.value.length === 0) {
      return (
        <TouchableOpacity style={styles.touchableArea} onPress={props.onPress}>
          <View style={styles.container}>
            <Icon
              type={props.iconType}
              name={props.iconName}
              color={Colors.PrimaryDarkBlue}
              size={24}
              iconStyle={{ marginLeft: 10 }}
            />
            <Text style={styles.textStyleGrey}>{props.placeholderText}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.touchableArea} onPress={props.onPress}>
          <View style={styles.container}>
            <Icon
              type={props.iconType}
              name={props.iconName}
              color={Colors.PrimaryDarkBlue}
              size={24}
              iconStyle={{ marginLeft: 10 }}
            />
            <View>
              {props.value.map((category, i) => (
                <Text style={styles.textStyleBlue} key={i}>
                  {category}
                </Text>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }
};

const styles = EStyleSheet.create({
  touchableArea: {
    width: "100%",
  },
  container: {
    paddingVertical: 9,
    marginVertical: 2,
    flexDirection: "row",
    width: "100%",
  },
  textStyleGrey: {
    marginLeft: 10,
    fontSize: 14,
    marginTop: 4,
    color: "$lightGrey",
  },
  textStyleBlue: {
    marginLeft: 10,
    fontSize: 14,
    marginTop: 4,
    color: "$primaryDarkBlue",
  },
});
