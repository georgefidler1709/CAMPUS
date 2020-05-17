import * as React from "react";
import { Input } from "react-native-elements";
import { Colors } from "../../constants";
import EStyleSheet from "react-native-extended-stylesheet";

export default ({ onChangeText, value, containerStyle }) => {
  return (
    <Input
      containerStyle={containerStyle}
      inputContainerStyle={{ borderColor: Colors.LightGrey }}
      inputStyle={styles.titleInput}
      placeholder="Enter Title"
      placeholderTextColor={Colors.LightGrey}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

const styles = EStyleSheet.create({
  titleInput: {
    fontSize: 22,
    color: "$primaryDarkBlue"
  }
});
