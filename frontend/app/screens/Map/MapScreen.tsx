import React from "react";
import MapView, { Marker, Circle } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { View, Text, SafeAreaView } from "react-native";
import { isPointWithinRadius } from "geolib";
import * as Permission from 'expo-permissions'
import {
  DEFAULT_LAT_DELTA,
  DEFAULT_LONG_DELTA,
  DIRECTING_LAT_DELTA,
  DIRECTING_LONG_DELTA,
  EVENT_RADIUS,
} from "../../constants/Location";
import {
  collectLocations,
  collectOnGoingEvents,
  searchLocations,
} from "../../api";
import { Event } from "../../types/events";
import { Location, FocusLocation } from "../../types/location";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { Icon, Button } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import Dimensions from "../../styles/Dimensions";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { primaryColors, OPACITY_MODIFIER } from "../../constants/Colors";
import {
  setFocus,
  setTargetLocation,
  setSearchQuery,
  setUserCoords,
  setIsDirecting,
} from "../../reduxstore/actions/location";
import { connect } from "react-redux";
import _ from "lodash";
import Moment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);

// @ts-ignore
import { MAPS_API_KEY } from "react-native-dotenv";
import { FakeSearchBarButton } from "../../components/Buttons";

interface Coord {
  latitude: number;
  longitude: number;
}

interface MapScreenState {
  mapView: MapView | undefined;
  directingDistance: number | undefined;
  directingDuration: number | undefined;
}

interface MapScreenProps {
  navigation: ProfileScreenNavigationProp;
  // current focus of the mapview - either the user's location or the target location
  focus: FocusLocation;
  // target location the user wants to view and/or receive directions to
  targetLocation: Location;
  // query to show in the search bar
  searchQuery: string;
  // user's location
  userCoords: Coord;
  // whether or not the user is currently being directed
  isDirecting: boolean;
  // List of all public events to show
  publicEvents: Event[];
  setUserCoords: (c: Coord) => void;
  setTargetLocation: (l: Location) => void;
  setIsDirecting: (b: boolean) => void;
  setFocus: (f: FocusLocation) => void;
  setSearchQuery: (s: string) => void;
}

class MapScreen extends React.Component<MapScreenProps, MapScreenState> {
  constructor(props: MapScreenProps) {
    super(props);
    this.state = {
      mapView: undefined,
      directingDistance: undefined,
      directingDuration: undefined,
    };
  }

  setMapView = (mapView: MapView) => {
    this.setState({ mapView });
  };

  setDirectingDuration = (directingDuration: number) => {
    this.setState({ directingDuration });
  };

  setDirectingDistance = (directingDistance: number) => {
    this.setState({ directingDistance });
  };

  async componentDidMount() {
    const { status } = await Permission.askAsync(Permission.LOCATION)
    this.props.navigation.setOptions({
      header: ({ navigation }) => {
        return null;
      },
    });
  }

  // update the mapview if the focus changes
  componentDidUpdate(prevProps: MapScreenProps, prevState: MapScreenState) {
    if (prevProps.userCoords === null && this.props.userCoords !== null) {
      this.updateRegion();
    } else if (prevProps.focus !== this.props.focus) {
      this.updateRegion();
    } else if (prevProps.targetLocation !== this.props.targetLocation) {
      this.updateRegion();
    }
  }

  // determines which region of the map to show based on the focus
  chooseRegion() {
    if (
      this.props.focus === FocusLocation.USER &&
      this.props.userCoords !== null
    ) {
      return this.props.isDirecting
        ? {
            ...this.props.userCoords,
            latitudeDelta: DIRECTING_LAT_DELTA,
            longitudeDelta: DIRECTING_LONG_DELTA,
          }
        : {
            ...this.props.userCoords,
            latitudeDelta: DEFAULT_LAT_DELTA,
            longitudeDelta: DEFAULT_LONG_DELTA,
          };
    } else if (
      this.props.focus === FocusLocation.TARGET_LOCATION &&
      this.props.targetLocation !== null
    ) {
      return {
        ...this.props.targetLocation.latlong,
        latitudeDelta: DEFAULT_LAT_DELTA,
        longitudeDelta: DEFAULT_LONG_DELTA,
      };
    }
  }

  // called after an update to determine if the region should be changed
  updateRegion() {
    const newRegion = this.chooseRegion();
    if (newRegion) {
      this.state.mapView?.animateToRegion(newRegion);
    }
  }

  // format the time to be displayed during navigation
  formatTime(date: Date, extraMinutes: number) {
    let newDate = new Date(date.getTime() + extraMinutes * 60000);
    var hours = newDate.getHours();
    var minutes: number | string = newDate.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  // filter public events to only show those happening right now
  getOnGoingEvents = () =>
    _.filter(this.props.publicEvents, (event) => {
      const startTime = moment(event.start_time);
      const endTime = moment(event.end_time);
      const eventRange = moment.range(startTime, endTime);
      const now = moment();
      return now.within(eventRange);
    }).filter((e) => e.location);

  // show a location's page (used after a search for a location)
  showLocation = (
    l: Location,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    this.props.setFocus(FocusLocation.TARGET_LOCATION);
    this.props.setTargetLocation(l);
    this.props.setSearchQuery(l.name);
    searchModalNavigation.goBack();
    this.props.navigation.navigate("LocationModal");
  };

  render() {
    const onGoingEvents = this.getOnGoingEvents();

    return (
      <View style={styles.container}>
        {/* Button designed to look like a search bar that will load the search modal when pressed */}
        <FakeSearchBarButton
          relative={false}
          text={this.props.searchQuery}
          onPress={() =>
            this.props.navigation.navigate("SearchModal", {
              onItemSelect: this.showLocation,
              searchQueryInit: this.props.searchQuery,
              setSearchQueryExternal: this.props.setSearchQuery,
              searchItems: searchLocations,
              leftIconProps: { name: "place", type: "material" },
            })
          }
        />
        {/* Map component from react-native-maps */}
        <MapView
          initialRegion={this.chooseRegion()}
          ref={this.setMapView}
          style={styles.mapStyle}
          provider="google"
          showsUserLocation={true}
          onUserLocationChange={(res) => {
            this.props.setUserCoords({
              latitude: res.nativeEvent.coordinate.latitude,
              longitude: res.nativeEvent.coordinate.longitude,
            });
          }}
        >
          {/* show ongoing events on the map both as a map marker
           *  and a circle radius to highlight the action
           */}

          {onGoingEvents &&
            onGoingEvents.map((event, i) => {
              const color = primaryColors[i % primaryColors.length];
              return event.location ? (
                <React.Fragment key={i}>
                  <Marker
                    pinColor={color}
                    key={event.location.id}
                    title={event.location.name}
                    coordinate={event.location.latlong}
                    onPress={() => {
                      this.props.setTargetLocation(event.location!);
                      this.props.navigation.navigate("LocationModal");
                    }}
                  />
                  <Circle
                    key={event.eid}
                    center={event.location.latlong}
                    radius={EVENT_RADIUS}
                    strokeColor={color}
                    fillColor={color + OPACITY_MODIFIER} // reducing opacity
                  />
                </React.Fragment>
              ) : null;
            })}

          {/* What to show if the user is currently receiving directions */}
          {this.props.isDirecting && (
            // Firstly the directions themselves will be generated and shown as a polyline
            // and a marker to highlght the destination
            <>
              <Marker
                pinColor={"pink"}
                title={this.props.targetLocation.name}
                coordinate={this.props.targetLocation.latlong}
                onPress={() => {
                  this.props.navigation.navigate("LocationModal");
                }}
              />
              <MapViewDirections
                origin={this.props.userCoords}
                destination={this.props.targetLocation.latlong}
                waypoints={[]}
                mode="WALKING"
                apikey={MAPS_API_KEY}
                strokeWidth={3}
                strokeColor="hotpink"
                onReady={(result) => {
                  this.setDirectingDistance(result.distance);
                  this.setDirectingDuration(result.duration);
                }}
              />
            </>
          )}
        </MapView>
        {/* Secondly show the bottom bar giving information
         * such as how far away the destination is and an
         * estimated time of arrival
         */}
        {this.props.isDirecting &&
          this.state.directingDistance &&
          this.state.directingDuration && (
            <View style={styles.directingOverlayContainer}>
              <View style={styles.directingInfo}>
                <Text style={{ fontSize: 35, color: "darkgreen" }}>
                  {Math.round(this.state.directingDuration) + " min"}
                </Text>
                <Text style={{ fontSize: 20, paddingLeft: 5 }}>
                  {this.formatTime(new Date(), this.state.directingDuration) +
                    "  -  " +
                    (this.state.directingDistance < 1
                      ? Math.round(this.state.directingDistance * 1000) + "m"
                      : this.state.directingDistance.toFixed(2) + "km")}
                </Text>
              </View>
              <Button
                onPress={() => this.props.setIsDirecting(false)}
                type="clear"
                icon={<Icon type="material" name="highlight-off" size={50} />}
              />
            </View>
          )}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  mapStyle: {
    flex: 1,
    width: Dimensions.width,
    zIndex: 0,
  },
  directingOverlayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    position: "absolute",
    bottom: 0,
    width: Dimensions.width,
    height: Dimensions.height * 0.1,
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  directingInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    marginHorizontal: 30,
    marginVertical: 5,
  },
});

const MapScreenContainer = connect(
  (state) => ({
    focus: state.location.focus,
    targetLocation: state.location.targetLocation,
    searchQuery: state.location.searchQuery,
    userCoords: state.location.userCoords,
    isDirecting: state.location.isDirecting,
    publicEvents: state.events.publicEvents,
  }),
  { setFocus, setTargetLocation, setSearchQuery, setUserCoords, setIsDirecting }
)(MapScreen);

export default MapScreenContainer;
