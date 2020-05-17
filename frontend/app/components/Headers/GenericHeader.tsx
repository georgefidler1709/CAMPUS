import React, { Component } from "react";
import { Text, StyleProp, ViewStyle } from "react-native";

import EStyleSheet from "react-native-extended-stylesheet";
import HeaderContainer from "./HeaderContainer";

interface GenericHeaderProps {
  style: StyleProp<ViewStyle> | undefined;
  leftElement?: JSX.Element | string;
  rightElement?: JSX.Element;
}

class GenericHeader extends Component<GenericHeaderProps> {
  render() {
    return (
      <HeaderContainer style={this.props.style}>
        {typeof this.props.leftElement === "string" ? (
          <Text style={styles.titleStyle}>{this.props.leftElement}</Text>
        ) : (
          <>{this.props.leftElement}</>
        )}

        {this.props.rightElement}
      </HeaderContainer>
    );
  }
}

export default GenericHeader;

const styles = EStyleSheet.create({
  titleStyle: {
    color: "$primaryDarkBlue",
    fontSize: 22,
    fontWeight: "500",
    marginLeft: 25,
  },
});
