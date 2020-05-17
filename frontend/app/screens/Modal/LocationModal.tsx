import React, { Component } from "react";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { View, Text, StyleSheet, Image } from "react-native";
import { ListItem } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { Location, Coords, FocusLocation } from "../../types/location";
import { getDistance } from "geolib";
import { Colors } from "../../constants";
import { setIsDirecting, setFocus } from "../../reduxstore/actions/location";
import { Icon } from "react-native-elements";
import { connect } from "react-redux";
import {
  CrossButton,
  MainListItem,
  HeaderButton,
} from "../../components/Buttons";
import { Event } from "../../types/events";
import { collectOnGoingEvents } from "../../api";
import MiniMap from "../../components/Map/MiniMap";
import ModalTitle from "../../components/Titles/ModalTitle";
import GenericHeader from "../../components/Headers/GenericHeader";

interface LocationModalProps {
  navigation: ProfileScreenNavigationProp;
  targetLocation: Location;
  focus: FocusLocation;
  userCoords: Coords;
  setIsDirecting: (b: boolean) => void;
  setFocus: (f: FocusLocation) => void;
}

interface LocationModalState {
  onGoingEvents: Event[];
}

class LocationModal extends Component<LocationModalProps, LocationModalState> {
  constructor(props: LocationModalProps) {
    super(props);
    this.state = {
      onGoingEvents: [],
    };
  }

  // when the component loads it will gather a list of ongoing events occurring at this location
  componentDidMount() {
    collectOnGoingEvents().then((events) => {
      this.setOnGoingEvents(
        events.filter(
          (e) => e.location && e.location.id === this.props.targetLocation.id
        )
      );
    });

    this.props.navigation.setOptions({
      header: ({ navigation }) => {
        return (
          <GenericHeader
            leftElement={
              <HeaderButton
                onPress={this.goBack}
                style={{ marginLeft: 10 }}
                iconType="material"
                iconName="arrow-back"
              />
            }
            style={{ height: 120 }}
          />
        );
      },
    });
  }

  goBack = () => {
    this.props.navigation.goBack();
  };

  setOnGoingEvents = (onGoingEvents: Event[]) => {
    this.setState({ onGoingEvents });
  };

  render() {
    const location = this.props.targetLocation;
    return (
      <View style={styles.container}>
        {/* generic minimap component used as a compressed map view
         * to show the position of this location
         */}
        <MiniMap locationCoords={location.latlong} />
        <View style={styles.blankSpace} />
        {/* Title including broad information about the location e.g. location name
            as well as personalised info e.g. how far away the location is from the user.
            The user can then choose to receive directions to this location.
         */}
        <ModalTitle
          title={this.props.targetLocation.name}
          subtitle={`${getDistance(
            location.latlong,
            this.props.userCoords
          )}m away`}
          imgUri={require("../../assets/location-icon.jpg")}
          buttonIcon={{
            name: "directions",
            type: "material",
            color: Colors.PrimaryLightBlue,
            size: 50,
          }}
          onButtonPress={() => {
            this.props.setIsDirecting(true);
            this.props.setFocus(FocusLocation.USER);
            this.goBack();
          }}
        />
        <View style={styles.blankSpace}></View>
        <Text style={{ marginLeft: 15, fontWeight: "bold" }}>
          Capacity: {this.props.targetLocation.capacity}
        </Text>
        <View style={styles.blankSpace}></View>
        <Text style={styles.subTitle}>Events Happening Right Now:</Text>
        {/* List displaying all events currently happening at the location as selectable list items*/}
        {this.state.onGoingEvents.map((event, i) => (
          <ListItem
            onPress={() => {
              this.props.navigation.navigate("EventDetails", { event: event });
            }}
            containerStyle={{
              borderBottomWidth: 1,
              borderColor: Colors.LightGrey,
              paddingLeft: 18,
              paddingRight: 27,
            }}
            key={i}
            leftIcon={{
              name: "event-available",
              color: Colors.PrimaryDarkBlue,
            }}
            rightIcon={{
              name: "arrow-forward",
              color: Colors.PrimaryDarkBlue,
              size: 25,
            }}
            title={event.name}
          />
        ))}
      </View>
    );
  }
}

const LocationModalContainer = connect(
  (state) => ({
    focus: state.location.focus,
    targetLocation: state.location.targetLocation,
    userCoords: state.location.userCoords,
  }),
  { setIsDirecting, setFocus }
)(LocationModal);

export default LocationModalContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topContainer: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    margin: 1,
    height: Dimensions.height * 0.1,
  },
  titleBar: {
    backgroundColor: "#fff",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
    marginHorizontal: 10,
  },
  titleImage: {
    borderRadius: 200,
    width: Dimensions.height * 0.1,
    height: Dimensions.height * 0.1,
    overflow: "hidden",
  },
  item: {
    width: Dimensions.width,
  },
  icon: {
    backgroundColor: "#ebebeb",
    borderRadius: 20,
    padding: 5,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: "white",
  },
  blankSpace: {
    width: Dimensions.width,
    height: Dimensions.height * 0.02,
  },
  subTitle: {
    paddingLeft: 15,
    fontWeight: "bold",
    width: Dimensions.width,
    borderBottomWidth: 1,
    borderColor: Colors.LightGrey,
  },
});
