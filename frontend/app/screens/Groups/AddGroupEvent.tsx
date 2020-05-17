import React, { Component } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Text,
  YellowBox
} from "react-native";
import { Button, Slider } from "react-native-elements";
import { RouteProp } from "@react-navigation/native";
import EStyleSheet, { create } from "react-native-extended-stylesheet";
import {
  CrossButton,
  BlueTextButton,
  DetailsButton,
  Switcher,
} from "../../components/Buttons";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import ModalHeader from "../../components/Headers/ModalHeader";
import { CircleImage } from "../../components/Images";
import { TitleInput, DetailsInput, TimeInput } from "../../components/Inputs";
import { connect } from "react-redux";
import { setCurrentDate } from "../../reduxstore/actions/calendar";
import { UpdateEvent, Event, Category } from "../../types/events";
import { Location } from "../../types/location";
import {
  createEvent,
  collectCalendarEvents,
  updateEvent,
  deleteEvent,
  createGroupEvent,
  searchLocations,
} from "../../api";
import moment from "moment";
import { WaveIndicator, BallIndicator } from "react-native-indicators";
import { Colors } from "../../constants";
import { SelectCategories, CategorySelector } from "../Events/components";
import { CategoriesToStr } from "../../modules";

YellowBox.ignoreWarnings([
  "Value for argument",
]);

interface AddGroupEventProps {
  navigation: ProfileScreenNavigationProp;
  setCurrentDate: (date: moment.Moment) => void;
  currentDate: moment.Moment;
  route: RouteProp<Record<string, AddGroupEventRouteProps>, string>;
}

interface AddGroupEventState {
  newEvent: {
    name: string;
    description: string;
    start_time: moment.Moment;
    end_time: moment.Moment;
    location: Location | null;
    categories: Category[];
    eid: string;
    public_event: boolean;
    capacity: number;
  };
  mode: "create" | "edit";
  startCalendarVisible: boolean;
  endCalendarVisible: boolean;
  categorySelectorVisible: boolean;
  loading: boolean;
}

interface AddGroupEventRouteProps {
  event: Event;
  mode: "create" | "edit";
  gid: string;
  onUpdate: (event: Event) => void;
}

class AddGroupEvent extends Component<AddGroupEventProps, AddGroupEventState> {
  constructor(props: AddGroupEventProps) {
    super(props);
    this.state = {
      newEvent: {
        eid: "",
        name: "",
        location: null,
        description: "",
        categories: [],
        start_time: this.props.currentDate
          .clone()
          .add(1, "hour")
          .startOf("hour"),
        end_time: this.props.currentDate.clone().add(2, "hour").startOf("hour"),
        public_event: true,
        capacity: 1,
      },
      mode: "create",
      startCalendarVisible: false,
      endCalendarVisible: false,
      categorySelectorVisible: false,
      loading: false,
    };
  }

  /**
   * If we are editing an event, pull the event details from the
   * previous page and apply them
   */
  componentDidMount() {
    this.setState({ mode: this.props.route.params.mode });
    if (this.props.route.params.mode === "edit") {
      const {
        eid,
        name,
        description,
        start_time,
        end_time,
        location,
        categories,
        public_event,
        capacity,
      } = this.props.route.params.event;

      const startTime = moment(start_time);
      const endTime = moment(end_time);
      const sliderVal = this.calculateCapacity(capacity, false);

      this.setState({
        newEvent: {
          ...this.state.newEvent,
          eid,
          name,
          description,
          start_time: startTime,
          end_time: endTime,
          location,
          categories,
          public_event,
          capacity: sliderVal,
        },
      });
    }    
    
    this.props.navigation.setOptions({
        header: ({ navigation }) => {
          return null
      }
    });
  }

  goBack = () => {
    this.props.navigation.goBack();
  };

  goBackAndUpdate = () => {
    this.props.navigation.navigate("GroupDetails", {update: true});
  }

  /**
   * Change a value in the state. This is used for
   * values that don't have a secondary effect on other values
   */
  onChangeVal = (key: string, val: any) => {
    this.setState({
      newEvent: {
        ...this.state.newEvent,
        [key]: val,
      },
    });
  };

  /**
   * Save the event details to the backend. If this is an event creation
   * page, create the event. If its an edit event page, update the event.
   * Then, pass the new state back to the event details page for it to display
   */
  onSave = async () => {
    this.setState({ loading: true });
    const locationId =
      this.state.newEvent.location !== null
        ? this.state.newEvent.location.id
        : "";

    const capacity = this.calculateCapacity(this.state.newEvent.capacity, true);

    let newEvent: UpdateEvent = {
      name: this.state.newEvent.name,
      description: this.state.newEvent.description,
      start_time: this.state.newEvent.start_time.toISOString(),
      end_time: this.state.newEvent.end_time.toISOString(),
      public_event: this.state.newEvent.public_event,
      location_id: locationId,
      capacity,
      categories: this.state.newEvent.categories,
    };

    if (this.state.mode === "create") {
      await createGroupEvent(this.props.route.params.gid, newEvent);
      const events = await collectCalendarEvents();
      this.setState({ loading: false });
    } else {
      const eid = await updateEvent(this.state.newEvent.eid, newEvent);
      const events = await collectCalendarEvents();

      const fullEvent: Event = {
        ...this.props.route.params.event,
        location: this.state.newEvent.location,
        name: this.state.newEvent.name,
        description: this.state.newEvent.description,
        start_time: this.state.newEvent.start_time.toISOString(),
        end_time: this.state.newEvent.end_time.toISOString(),
        public_event: this.state.newEvent.public_event,
        capacity,
        categories: this.state.newEvent.categories,
      };

      this.props.route.params.onUpdate(fullEvent);
      this.setState({ loading: false });
    }

    this.props.setCurrentDate(this.state.newEvent.start_time);
    this.goBackAndUpdate();
  };

  /**
   * Open and close the start time calendar widget. If the other
   * one is currently open, close it first
   */
  toggleStartCalendar = () => {
    if (!this.state.startCalendarVisible) {
      if (this.state.endCalendarVisible) {
        this.setState({ endCalendarVisible: false });
      }
      this.setState({ startCalendarVisible: true });
    } else {
      this.setState({ startCalendarVisible: false });
    }
  };

  /**
   * Open and close the end time calendar widget. If the other
   * one is currently open, close it first
   */
  toggleEndCalendar = () => {
    if (!this.state.endCalendarVisible) {
      if (this.state.startCalendarVisible) {
        this.setState({ startCalendarVisible: false });
      }
      this.setState({ endCalendarVisible: true });
    } else {
      this.setState({ endCalendarVisible: false });
    }
  };

  /**
   * Change the start time of the event. If it is after the currently set
   * end time, move the end time to be one hour after the new start time
   */
  onChangeStart = (event: any, selectedDate: Date) => {
    const start_time = moment(selectedDate);

    if (start_time.isSameOrAfter(this.state.newEvent.end_time)) {
      const end_time = start_time.clone();
      end_time.add(1, "hour");
      this.setState({
        newEvent: { ...this.state.newEvent, start_time, end_time },
      });
    } else {
      this.setState({ newEvent: { ...this.state.newEvent, start_time } });
    }
  };

  /**
   * Change the end time of the event. If it is before the currently set
   * start time, move the start time to be one hour before the new end time
   */
  onChangeEnd = (event: any, selectedDate: Date) => {
    const end_time = moment(selectedDate);

    if (end_time.isSameOrBefore(this.state.newEvent.start_time)) {
      const start_time = end_time.clone();
      start_time.subtract(1, "hour");
      this.setState({
        newEvent: { ...this.state.newEvent, start_time, end_time },
      });
    } else {
      this.setState({ newEvent: { ...this.state.newEvent, end_time } });
    }
  };

  /**
   * Prompt the user then delete event if they confirm
   */
  deleteEvent = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          this.setState({ loading: true });
          await deleteEvent(this.state.newEvent.eid);
          const events = await collectCalendarEvents();
          this.setState({ loading: false });
          this.props.navigation.navigate("Calendar");
        },
      },
    ]);
  };

  /**
   * Take the categories that have been selected and add them to the new event
   * state object
   */
  onSelectedCategories = (categories: CategorySelector[]) => {
    let selectedCategories: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].isSelected) {
        selectedCategories.push(categories[i].categoryId);
      }
    }

    this.setState({
      newEvent: { ...this.state.newEvent, categories: selectedCategories },
      categorySelectorVisible: false,
    });
  };

  /**
   * Convert capacity to and from value that the slider can understand.
   * If convertToCapacity is true, the input number is a slider value to be converted
   * to a capacity. If it is false, the input is a capacity to be converted to a
   * slider value
   */
  calculateCapacity = (val: number | null, convertToCapacity: boolean) => {
    if (convertToCapacity && val) {
      // If slider set to top, unlimited capacity, so return null
      if (val === 1) {
        return null;
      }

      return Math.round(val * 300);
    } else {
      if (val === null) {
        return 1;
      }

      return val / 300;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <SelectCategories
          visible={this.state.categorySelectorVisible}
          onCancel={() => this.setState({ categorySelectorVisible: false })}
          onDone={this.onSelectedCategories}
          selectedCategories={this.state.newEvent.categories}
        />
        <ScrollView contentContainerStyle={{ alignItems: "center" }}>
          <SafeAreaView style={styles.subContainer}>
            <ModalHeader
              title={this.state.mode === "create" ? "Add Group Event" : "Edit Event"}
              leftButton={
                <CrossButton
                  style={{ position: "absolute", left: 0 }}
                  onPress={this.goBack}
                />
              }
              rightButton={
                <BlueTextButton
                  containerStyle={{ position: "absolute", right: 0 }}
                  text="Save"
                  textSize={18}
                  onPress={this.onSave}
                  active={this.state.newEvent.name}
                />
              }
            />
            {/* <CircleImage style={{ marginTop: "6%" }} uri={null} size={95} />
            <BlueTextButton
              containerStyle={{ paddingTop: 5 }}
              text="Add picture"
              textSize={13}
              onPress={null}
              active={true}
            /> */}
            <TitleInput
              containerStyle={{ marginTop: 35 }}
              onChangeText={(text: string) => this.onChangeVal("name", text)}
              value={this.state.newEvent.name}
            />
            <View style={styles.timeContainer}>
              <TimeInput
                date={this.state.newEvent.start_time}
                calendarVisible={this.state.startCalendarVisible}
                onPress={this.toggleStartCalendar}
                onChangeDate={this.onChangeStart}
              />
              <TimeInput
                date={this.state.newEvent.end_time}
                calendarVisible={this.state.endCalendarVisible}
                onPress={this.toggleEndCalendar}
                onChangeDate={this.onChangeEnd}
              />
            </View>
            <DetailsButton
              iconType="material"
              iconName="location-on"
              placeholderText="Add location"
              value={this.state.newEvent.location?.name}
              onPress={() =>
                this.props.navigation.navigate("SearchModal", {
                  searchQueryInit: "",
                  setSearchQueryExternal: () => {},
                  searchItems: searchLocations,
                  leftIconProps: {name: "place", type: "material"},
                  onItemSelect: (l: Location, searchNav: ProfileScreenNavigationProp) => {
                    this.setState({
                      newEvent: { ...this.state.newEvent, location: l },
                    });
                    searchNav.goBack();
                  },
                })
              }
            />
            <DetailsInput
              placeholder="Add description"
              value={this.state.newEvent.description}
              onChangeText={(text: string) =>
                this.onChangeVal("description", text)
              }
              iconType="material-community"
              iconName="text"
              multiline
            />
            <DetailsButton
              placeholderText="Add categories"
              value={CategoriesToStr(this.state.newEvent.categories)}
              iconType="material-community"
              iconName="buffer"
              onPress={() => this.setState({ categorySelectorVisible: true })}
            />
            <View style={styles.divider} />
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: "100%", marginVertical: 10 }}
                value={this.state.newEvent.capacity}
                thumbStyle={styles.thumbStyle}
                maximumTrackTintColor={Colors.LightGrey}
                minimumTrackTintColor={Colors.PrimaryLightBlue}
                onValueChange={(capacity) =>
                  this.setState({
                    newEvent: { ...this.state.newEvent, capacity },
                  })
                }
                minimumValue={0.01}
              />
              <Text style={styles.sliderText}>
                Capacity -{" "}
                {this.calculateCapacity(this.state.newEvent.capacity, true) ===
                null
                  ? "Unlimited"
                  : this.calculateCapacity(this.state.newEvent.capacity, true)}
              </Text>
            </View>
            <View style={[styles.divider, { marginTop: 20 }]} />

            <Switcher
              label="Public Event"
              value={this.state.newEvent.public_event}
              onToggleSwitch={() =>
                this.onChangeVal(
                  "public_event",
                  !this.state.newEvent.public_event
                )
              }
            />
            {this.state.mode === "edit" && (
              <Button
                title="Delete Event"
                onPress={this.deleteEvent}
                containerStyle={{ width: "95%" }}
                buttonStyle={{
                  backgroundColor: Colors.Red,
                  width: "100%",
                  marginTop: 10,
                }}
              />
            )}
            <Modal
              visible={this.state.loading}
              transparent={true}
              animationType="fade"
            >
              <View style={styles.loadingModalStyle}>
                <BallIndicator color="white" size={50} />
              </View>
            </Modal>
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { currentDate } = state.calendar;
  return {
    currentDate,
  };
};

const mapDispatchToProps = {
  setCurrentDate,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddGroupEvent);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$white",
  },
  subContainer: {
    flex: 1,
    alignItems: "center",
    width: "90%",
  },
  timeContainer: {
    width: "95%",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "$lightGrey",
  },
  divider: {
    backgroundColor: "$lightGrey",
    height: 1,
    width: "95%",
  },
  sliderContainer: {
    width: "95%",
  },
  sliderText: {
    color: "$primaryDarkBlue",
    fontWeight: "500",
  },
  thumbStyle: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingModalStyle: {
    flex: 1,
    backgroundColor: "black",
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
