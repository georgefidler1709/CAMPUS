import React, { Component } from "react";
import { View, SafeAreaView, StyleProp, ViewStyle } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

interface HeaderContainerProps {
  style: StyleProp<ViewStyle> | undefined;
  extraComponent?: any;
}

class HeaderContainer extends Component<HeaderContainerProps> {
  render() {
    return (
      <SafeAreaView style={[styles.container, this.props.style]}>
        <View style={styles.contentContainer}>{this.props.children}</View>
        {this.props.extraComponent}
      </SafeAreaView>
    );
  }
}

export default HeaderContainer;

const styles = EStyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "$white",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 23,
  },
});
