import * as React from "react";
import { Input, Icon } from "react-native-elements";
import { Colors } from "../../constants";
import EStyleSheet from "react-native-extended-stylesheet";

export default (props: any) => {
  return (
    <Input
      {...props}
      containerStyle={[styles.container, props.containerStyle]}
      inputContainerStyle={{
        borderBottomWidth: props.underlined ? 1 : 0,
        borderBottomColor: Colors.LightGrey,
        justifyContent: "flex-start",
      }}
      inputStyle={styles.titleInput}
      leftIcon={
        <Icon
          type={props.iconType}
          name={props.iconName}
          color={Colors.PrimaryDarkBlue}
          size={24}
        />
      }
      leftIconContainerStyle={styles.iconContainerStyle}
      placeholderTextColor={Colors.LightGrey}
    />
  );
};

const styles = EStyleSheet.create({
  container: {
    marginVertical: 2,
    backgroundColor: "white",
    alignItems: "flex-start",
  },
  titleInput: {
    fontSize: 14,
    color: "$primaryDarkBlue",
  },
  iconContainerStyle: {
    marginLeft: 0,
    marginRight: 10,
  },
});
