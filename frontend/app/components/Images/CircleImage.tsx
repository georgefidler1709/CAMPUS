import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { Image } from "react-native-elements";
import { LinearGradient } from "expo-linear-gradient";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";

export default ({ uri, size, style }) => {
  return (
    <View
      style={[
        styles.container,
        style,
        { height: size, width: size, borderRadius: size / 2 },
      ]}
    >
      {uri ? (
        <Image
          source={isNaN(uri) ? { uri } : uri}
          style={{ height: size, width: size }}
          PlaceholderContent={<ActivityIndicator color={Colors.White} />}
        />
      ) : (
        <LinearGradient
          style={{ height: size, width: size }}
          colors={["#f5f5f5", "#dfdfdf"]}
        />
      )}
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
