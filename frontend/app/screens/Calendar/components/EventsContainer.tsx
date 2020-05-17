import React, { Component } from "react";
import { View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import Dimensions from "../../../styles/Dimensions";

interface EventsContainerProps {
  topOffset: number;
}

class EventsContainer extends Component<EventsContainerProps> {
  render() {
    return (
      <View style={[styles.container, { top: this.props.topOffset }]}>
        {this.props.children}
      </View>
    );
  }
}

export default EventsContainer;

const styles = EStyleSheet.create({
  container: {
    width: "85%",
    position: "absolute",
    flexDirection: "row",
    left: Dimensions.width * 0.13
  }
});
