import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { CircleImage } from "../../components/Images";
import { IconProps } from "react-native-elements";
import { Colors } from "../../constants";

interface ModalTitleProps {
  title: string;
  subtitle: string;
  imgUri: string;
  buttonIcon?: IconProps;
  onButtonPress?: () => void;
  titleSize?: number;
  subtitleSize?: number;
}

export default (props: ModalTitleProps) => {
  const {
    title,
    subtitle,
    buttonIcon,
    onButtonPress,
    titleSize,
    subtitleSize,
    imgUri,
  } = props;
  return (
    <View style={styles.titleBar}>
      <CircleImage uri={imgUri} size={75} style={null} />
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flexDirection: "column", marginHorizontal: 10 }}>
          <Text
            style={{
              fontSize: titleSize ? titleSize : 25,
              color: Colors.PrimaryDarkBlue,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: subtitleSize ? subtitleSize : 15,
              marginTop: 5,
              color: Colors.PrimaryDarkBlue,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {buttonIcon && onButtonPress && (
        <Button type="clear" icon={buttonIcon} onPress={onButtonPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleBar: {
    backgroundColor: "#fff",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },
});
