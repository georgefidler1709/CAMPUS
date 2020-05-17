import React, { Component } from "react";
import { View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Colors } from "../../constants";
import Dimensions from "../../styles/Dimensions";
import { BallIndicator } from "react-native-indicators";

class SplashScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <BallIndicator color={Colors.PrimaryDarkBlue} size={50} />
      </View>
    );
  }
}

export default SplashScreen;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.width * 0.8,
    alignSelf: "center",
  },
});
