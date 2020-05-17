import { Button, IconProps } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import React from "react";

interface BorderButtonProps {
  title: string;
  color: string;
  iconProps: IconProps;
  onPress: () => void;
  buttonStyle?: object;
  loading?: boolean;
}

export default (props: BorderButtonProps) => {
  return (
    <Button
      type={"clear"}
      title={props.title}
      loading={props.loading}
      loadingProps={{ color: "white" }}
      containerStyle={{
        width: Dimensions.width * 0.85,
        borderRadius: 0,
        borderColor: props.color,
        borderWidth: 1,
        ...props.buttonStyle,
      }}
      titleStyle={{ color: props.color }}
      icon={{
        color: props.color,
        type: "material",
        name: "add",
        ...props.iconProps,
      }}
      iconRight={true}
      onPress={() => {
        if (!props.loading) {
          props.onPress();
        }
      }}
    />
  );
};
