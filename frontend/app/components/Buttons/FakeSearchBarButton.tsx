import React from "react";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { View, Text } from "react-native";
import {
  DEFAULT_LAT_DELTA,
  DEFAULT_LONG_DELTA,
  DIRECTING_LAT_DELTA,
  DIRECTING_LONG_DELTA,
} from "../../constants/Location";
import { collectLocations } from "../../api";
import { Location, FocusLocation } from "../../types/location";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { Icon, Button } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import Dimensions from "../../styles/Dimensions";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface FakeSearchBarButtonProps {
  text: string;
  onPress: () => void;
  relative: boolean;
  shadowProps?: object;
}

export default (props: FakeSearchBarButtonProps) => {
  return props.relative ? (
    <View style={{ ...styles.searchOverlayContainer, position: "relative" }}>
      <View
        style={{ ...styles.blankSpace, height: Dimensions.height * 0.02 }}
      />
      <TouchableWithoutFeedback
        style={{ ...styles.searchBar, ...props.shadowProps }}
        onPress={props.onPress}
      >
        <Icon type="material" name="search" size={20} />
        <Text style={styles.searchBarInput}>{props.text}</Text>
      </TouchableWithoutFeedback>
      <View
        style={{ ...styles.blankSpace, height: Dimensions.height * 0.02 }}
      />
    </View>
  ) : (
    <View style={{ ...styles.searchOverlayContainer }}>
      <View style={styles.blankSpace} />
      <TouchableWithoutFeedback
        style={styles.searchBar}
        onPress={props.onPress}
      >
        <Icon type="material" name="search" size={20} />
        <Text style={styles.searchBarInput}>{props.text}</Text>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  blankSpace: {
    width: Dimensions.width,
    height: Dimensions.height * 0.05,
  },
  searchBar: {
    flexDirection: "row",
    width: Dimensions.width * 0.9,
    borderColor: "lightgrey",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    padding: 8,
  },
  searchBarInput: {
    flex: 1,
    paddingLeft: 10,
  },
  searchOverlayContainer: {
    zIndex: 1,
    position: "absolute",
    top: 0,
    left: Dimensions.width * 0.05,
  },
});
