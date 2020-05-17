import * as React from "react";
import { View, Text, RefreshControl } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import GenericHeader from "../../components/Headers/GenericHeader";
import { RouteProp } from "@react-navigation/native";
import HeaderButton from "../../components/Buttons/HeaderButton";
import MiniMap from "../../components/Map/MiniMap";
import { Event, RSVP, EventFilter } from "../../types/events";
import moment from "moment";
import { Colors } from "../../constants";
import ModalTitle from "../../components/Titles/ModalTitle";
import { ListItem } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import _ from "lodash";
import { connect } from "react-redux";
import { getDistance } from "geolib";
import { AVERAGE_WALKING_SPEED } from "../../constants/Location";
import { Location, Coords, FocusLocation } from "../../types/location";
import { InviteResponse } from "../../types/events";
import {
  setIsDirecting,
  setFocus,
  setTargetLocation,
} from "../../reduxstore/actions/location";
import {
  getEvent,
  respondToEvent,
  collectCalendarEvents,
  inviteToEvent,
  collectPublicEvents,
} from "../../api";
import { GroupStatus } from "../../types/groups";
import { BorderButton } from "../../components/Buttons";
import {
  setCalendarEvents,
  setPublicEvents,
} from "../../reduxstore/actions/events";
import { setCurrentDate } from "../../reduxstore/actions/calendar";
import { ScrollView } from "react-native-gesture-handler";
import { CategoriesToStr } from "../../modules";
import { User } from "../../types/user";

interface EventDetailsProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, EventDetailsRouteProps>, string>;
  userCoords: Coords;
  setCurrentDate: (date: moment.Moment) => void;
  setIsDirecting: (b: boolean) => void;
  setCalendarEvents: (events: Event[]) => void;
  setPublicEvents: (events: Event[]) => void;
  setFocus: (f: FocusLocation) => void;
  setTargetLocation: (l: Location) => void;
  publicEventsFilter: EventFilter;
}

interface EventDetailsState {
  event: Event;
  buttonLoading: boolean;
  refreshing: boolean;
  numAttendees: number;
}

interface EventDetailsRouteProps {
  event: Event;
  onDeleteNavigateTo: string;
  groupStatus?: GroupStatus;
}

class EventDetails extends React.Component<
  EventDetailsProps,
  EventDetailsState
> {
  constructor(props: EventDetailsProps) {
    super(props);
    this.state = {
      event: { ...props.route.params.event },
      buttonLoading: true,
      refreshing: false,
      numAttendees: this.calculateNumAttendees(props.route.params.event.rsvps),
    };
  }

  async componentDidMount() {
    const groupStatus = this.props.route.params.groupStatus;
    this.props.navigation.setOptions({
      header: () => {
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
              this.state.event.can_edit ||
              (groupStatus !== undefined &&
                groupStatus === GroupStatus.MEMBER) ? (
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
    const event = await getEvent(this.state.event.eid);
    const numAttendees = this.calculateNumAttendees(event.rsvps);
    this.setState({ event, buttonLoading: false, numAttendees });
  }

  refreshEventData = async () => {
    this.setState({ refreshing: true });
    const event = await getEvent(this.state.event.eid);
    const numAttendees = this.calculateNumAttendees(event.rsvps);
    this.setState({ event, refreshing: false, numAttendees });
  };

  calculateNumAttendees = (rsvps: RSVP[]) => {
    let numAttendees = 0;
    _.forEach(rsvps, (rsvp) => {
      if (rsvp.response === InviteResponse.ATTENDING) {
        numAttendees++;
      }
    });
    return numAttendees;
  };

  editEvent = () => {
    this.props.navigation.navigate("AddEvent", {
      mode: "edit",
      event: this.state.event,
      onUpdate: (event: Event) => {
        this.setState({ event });
      },
      onDeleteNavigateTo: this.props.route.params.onDeleteNavigateTo,
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
    let timeToEvent = -1;
    if (this.props.userCoords && event.location) {
      const distToEvent = getDistance(
        event.location.latlong,
        this.props.userCoords
      );
      timeToEvent = Math.max(
        1,
        Math.round(distToEvent / AVERAGE_WALKING_SPEED)
      );
    }
    return timeToEvent.toString();
  };

  onNavigatePress = () => {
    const { event } = this.props.route.params;
    if (event.location !== null) {
      this.props.setTargetLocation(event.location);
      this.props.setIsDirecting(true);
      this.props.setFocus(FocusLocation.USER);
      this.props.navigation.navigate("MainApp", {
        screen: "MapStackNavigator",
      });
    }
  };

  respondToEvent = async (respondWith: InviteResponse) => {
    this.setState({ buttonLoading: true });

    const response = await respondToEvent(this.state.event.eid, respondWith);
    const calendarEvents = await collectCalendarEvents();
    const publicEvents = await collectPublicEvents(
      this.props.publicEventsFilter
    );
    this.props.setCalendarEvents(calendarEvents);
    this.props.setPublicEvents(publicEvents);

    // Increment or decrement the 'going' users counter. This will only be a
    // local change, and won't affect the value in the db. It's just a bit of
    // good immediate feedback to the user
    let increment = 1;
    if (response === InviteResponse.ATTENDING) {
      increment = -1;
    }

    this.setState({
      buttonLoading: false,
      numAttendees: this.state.numAttendees - increment,
      event: {
        ...this.state.event,
        user_rsvp: { ...this.state.event.user_rsvp, response },
        remaining_capacity: this.state.event.remaining_capacity + increment,
      },
    });
  };

  viewOnCalendar = () => {
    this.props.setCurrentDate(moment(this.state.event.start_time));
    this.props.navigation.navigate("Calendar");
  };

  createCapacityString = (): string => {
    let initText: string;
    let capacityString = "";

    if (this.state.event.capacity) {
      initText = `${this.state.numAttendees}/${this.state.event.capacity}`;
    } else {
      initText = this.state.numAttendees.toString();
    }
    const singlePerson = " person going";
    const multiplePeople = " people going";

    if (this.state.numAttendees === 1) {
      capacityString = initText + singlePerson;
    } else {
      capacityString = initText + multiplePeople;
    }

    return capacityString;
  };

  renderButtons = () => {
    if (this.state.buttonLoading) {
      return (
        <BorderButton
          title="Going"
          color={Colors.White}
          buttonStyle={styles.regularButton}
          loading={this.state.buttonLoading}
          iconProps={{
            name: "done",
          }}
          onPress={() => {}}
        />
      );
    } else if (
      this.state.event.user_rsvp &&
      this.state.event.user_rsvp.response === InviteResponse.ATTENDING
    ) {
      if (this.props.route.params.onDeleteNavigateTo !== "Calendar") {
        return (
          <>
            <BorderButton
              title="View on Calendar"
              color={Colors.PrimaryLightBlue}
              buttonStyle={styles.topButton}
              iconProps={{
                name: "today",
              }}
              onPress={this.viewOnCalendar}
            />
            <BorderButton
              title="Not Going"
              color={Colors.Red}
              buttonStyle={styles.bottomButton}
              iconProps={{
                name: "close",
              }}
              onPress={() => this.respondToEvent(InviteResponse.NOT_ATTENDING)}
            />
          </>
        );
      } else {
        return (
          <BorderButton
            title="Not Going"
            color={Colors.Red}
            buttonStyle={styles.cancelButton}
            iconProps={{
              name: "close",
            }}
            onPress={() => this.respondToEvent(InviteResponse.NOT_ATTENDING)}
          />
        );
      }
    } else if (
      this.state.event.user_rsvp &&
      this.state.event.user_rsvp.response === InviteResponse.INVITED
    ) {
      return (
        <>
          <BorderButton
            title="Accept"
            color={Colors.White}
            buttonStyle={{
              ...styles.topButton,
              backgroundColor: Colors.PrimaryLightBlue,
            }}
            iconProps={{
              name: "done",
            }}
            onPress={() => this.respondToEvent(InviteResponse.ATTENDING)}
          />
          <BorderButton
            title="Decline"
            color={Colors.Red}
            buttonStyle={styles.bottomButton}
            iconProps={{
              name: "close",
            }}
            onPress={() => this.respondToEvent(InviteResponse.NOT_ATTENDING)}
          />
        </>
      );
    } else if (
      !this.state.event.capacity ||
      (this.state.event.capacity && this.state.event.remaining_capacity !== 0)
    ) {
      return (
        <BorderButton
          title="Going"
          color={Colors.White}
          buttonStyle={styles.regularButton}
          iconProps={{
            name: "done",
          }}
          onPress={() => this.respondToEvent(InviteResponse.ATTENDING)}
        />
      );
    } else {
      return undefined;
    }
  };

  render() {
    const goingUsers = this.state.event.rsvps
      .filter((r) => r.response === InviteResponse.ATTENDING)
      .map((r) => r.guest);
    const capacityStr = this.createCapacityString();

    let distanceStr = this.generateTimeToEvent(this.state.event);
    if (distanceStr == "-1") distanceStr = "No location specified";

    let list = [];

    const timeToEvent = this.generateTimeToEvent(this.state.event);
    if (timeToEvent !== "-1") {
      list.push({
        text: `${timeToEvent} minutes walk away`,
        icon: {
          type: "material",
          name: "directions-walk",
        },
      });
    }

    list.push({
      text: capacityStr,
      icon: {
        type: "material",
        name: "group",
      },
    });

    if (this.state.event.description) {
      list.push({
        text: this.state.event.description,
        icon: {
          type: "material",
          name: "subject",
        },
      });
    }

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ alignItems: "center" }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshEventData}
            />
          }
        >
          <View style={styles.subContainer}>
            {this.state.event.location !== null && (
              <MiniMap locationCoords={this.state.event.location.latlong} />
            )}
            <View style={styles.infoContainer}>
              <ModalTitle
                title={this.state.event.name}
                subtitle={this.generateTimeInfo(
                  this.state.event.start_time,
                  this.state.event.end_time
                )}
                imgUri={require("../../assets/event-icon.png")}
                subtitleSize={12}
                buttonIcon={
                  this.props.route.params.onDeleteNavigateTo !== "Map"
                    ? {
                        name: "directions",
                        type: "material",
                        color: Colors.PrimaryLightBlue,
                        size: 50,
                      }
                    : undefined
                }
                onButtonPress={
                  this.state.event.location !== null
                    ? this.onNavigatePress
                    : undefined
                }
              />
              <View style={styles.buttonContainer}>
                {this.renderButtons()}
                <BorderButton
                  title="Invite People"
                  color={Colors.White}
                  buttonStyle={styles.regularButton}
                  iconProps={{
                    name: "person-add",
                  }}
                  onPress={() =>
                    this.props.navigation.navigate("InviteUsers", {
                      eid: this.state.event.eid,
                    })
                  }
                />
              </View>

              {this.state.event && this.state.event.categories && (
                <View style={styles.categoriesContainer}>
                  {this.state.event.categories.map((cat, i) => (
                    <View style={styles.categoryContainer} key={i}>
                      <Text style={styles.category}>
                        {CategoriesToStr([cat])[0]}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: "2%" }}></View>
              {list.map((item, i) => (
                <ListItem
                  style={styles.item}
                  key={i}
                  title={item.text ? item.text : ""}
                  leftIcon={{
                    ...item.icon,
                    size: 20,
                    onPress: () => {
                      this.props.navigation.navigate("ListModal", {
                        items: goingUsers,
                        keyExtractor: (item: User, index: number) =>
                          item.uid + index,
                        imgUri: require("../../assets/user-icon.png"),
                        onPress: () => {},
                        title: "Attending",
                      });
                    },
                  }}
                />
              ))}
            </View>
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { userCoords } = state.location;
  const { publicEventsFilter } = state.events;
  return { userCoords, publicEventsFilter };
};

const mapDispatchToProps = {
  setTargetLocation,
  setIsDirecting,
  setFocus,
  setCalendarEvents,
  setCurrentDate,
  setPublicEvents,
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$white",
  },
  subContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    width: "90%",
    alignItems: "center",
  },
  item: {
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
  },
  topButton: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: "100%",
    borderColor: Colors.PrimaryLightBlue,
    marginTop: 25,
  },
  bottomButton: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderTopWidth: 0,
    width: "100%",
    borderColor: Colors.PrimaryLightBlue,
  },
  regularButton: {
    backgroundColor: Colors.PrimaryLightBlue,
    borderRadius: 5,
    width: "100%",
    marginTop: 25,
  },
  cancelButton: {
    borderRadius: 5,
    width: "100%",
    marginTop: 25,
  },
  categoriesContainer: {
    marginTop: 25,
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  categoryContainer: {
    backgroundColor: "$purple",
    padding: 5,
    margin: 4,
    borderRadius: 4,
  },
  category: {
    color: "$white",
  },
});
