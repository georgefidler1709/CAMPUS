import * as React from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import GenericHeader from "../../components/Headers/GenericHeader";
import { RouteProp } from "@react-navigation/native";
import HeaderButton from "../../components/Buttons/HeaderButton";
import MiniMap from "../../components/Map/MiniMap";
import { Event } from "../../types/events";
import moment from "moment";
import { Colors } from "../../constants";
import ModalTitle from "../../components/Titles/ModalTitle";
import { ListItem } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { connect } from "react-redux";
import { getDistance } from "geolib";
import { AVERAGE_WALKING_SPEED } from "../../constants/Location";
import { Location, Coords, FocusLocation } from "../../types/location";
import {
  setIsDirecting,
  setFocus,
  setTargetLocation,
} from "../../reduxstore/actions/location";

interface OnGoingEventDetailsProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, OnGoingEventDetailsRouteProps>, string>;
  userCoords: Coords;
  setIsDirecting: (b: boolean) => void;
  setFocus: (f: FocusLocation) => void;
  setTargetLocation: (l: Location) => void;
}

interface OnGoingEventDetailsState {
  event: Event;
}

interface OnGoingEventDetailsRouteProps {
  event: Event;
}

class OnGoingEventDetails extends React.Component<
  OnGoingEventDetailsProps,
  OnGoingEventDetailsState
> {
  constructor(props: OnGoingEventDetailsProps) {
    super(props);
    this.state = {
      event: {
        eid: "",
        name: "",
        start_time: "",
        end_time: "",
        location: null,
        description: "",
        public_event: true,
        capacity: 0,
        can_edit: true,
        categories: []
      },
    };
  }

  componentDidMount() {
    this.setState({ event: this.props.route.params.event });
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
            rightElement={
              this.state.event.can_edit ? (
                <HeaderButton
                  onPress={this.editEvent}
                  style={{ marginRight: 15 }}
                  iconType="material"
                  iconName="mode-edit"
                />
              ) : undefined
            }
            style={{ height: 120 }}
          />
        );
      },
    });
  }

  editEvent = () => {
    this.props.navigation.navigate("AddEvent", {
      mode: "edit",
      event: this.state.event,
      onUpdate: (event: Event) => {
        this.setState({ event });
      },
    });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  generateTimeInfo = (startTime: string, endTime: string) => {
    const start = moment(startTime);
    const end = moment(endTime);

    const dateInfo = start.format("ddd D MMM");
    const timeInfo = `${start.format("h:mmA")} - ${end.format("h:mmA")}`;
    return `${dateInfo} ~ ${timeInfo}`;
  };

  generateTimeToEvent = (event: Event) => {

    if (this.props.userCoords && event.location) {
      const distToEvent = getDistance(event.location.latlong, this.props.userCoords);
      return Math.max(1, Math.round(distToEvent / AVERAGE_WALKING_SPEED))
    }
    return 5;
  };

  onNavigatePress = () => {
    const { event } = this.props.route.params;
    if (event.location !== null) {
      this.props.setTargetLocation(event.location);
      this.props.setIsDirecting(true);
      this.props.setFocus(FocusLocation.USER);
      this.props.navigation.navigate("Map");
    }
  };

  render() {
    const list = [
      {
        text: `${this.generateTimeToEvent(this.state.event)} minutes away`,
        icon: {
          type: "material",
          name: "location-on",
        },
      },
      {
        text: `${this.state.event.capacity} people going`,
        icon: {
          type: "material",
          name: "group",
        },
      },
      {
        text: this.state.event.description,
        icon: {
          type: "material",
          name: "subject",
        },
      },
    ];

    return (
      <View style={styles.container}>
        {/* <MiniMap
          location={event.location}
        /> */}
        {this.state.event.location !== null && (
          <MiniMap locationCoords={this.state.event.location.latlong} />
        )}
        <ModalTitle
          title={this.state.event.name}
          subtitle={this.generateTimeInfo(
            this.state.event.start_time,
            this.state.event.end_time
          )}
          subtitleSize={12}
          buttonIcon={{
            name: "directions",
            type: "material",
            color: Colors.PrimaryLightBlue,
            size: 50,
          }}
          onButtonPress={
            this.state.event.location !== null
              ? this.onNavigatePress
              : undefined
          }
        />
        <View style={{ height: Dimensions.height * 0.05 }}></View>
        {list.map((item, i) => (
          <ListItem
            style={styles.item}
            key={i}
            title={item.text ? item.text : ""}
            leftIcon={{
              ...item.icon,
              size: 20,
            }}
          />
        ))}
      </View>
    );
  }
}

const OnGoingEventDetailsContainer = connect(
  (state) => ({
    userCoords: state.location.userCoords,
  }),
  { setTargetLocation, setIsDirecting, setFocus }
)(OnGoingEventDetails);

export default OnGoingEventDetailsContainer;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  item: {
    width: "100%",
  },
});
