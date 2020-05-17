import React, { Component } from "react";
import { View, Text, Button, ScrollView, YellowBox } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { CalendarView } from "./components";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { Values } from "../../constants";
import _ from "lodash";
import { connect } from "react-redux";
import { toggleCalendarOpen } from "../../reduxstore/actions/calendar";
import {
  setCalendarEvents,
  setPublicEvents,
} from "../../reduxstore/actions/events";
import {
  deleteEvent,
  collectCalendarEvents,
  collectPublicEvents,
} from "../../api";
import { Event, EventFilter } from "../../types/events";
import { LoadingOverlay } from "../../components/Modals";

YellowBox.ignoreWarnings(["Setting a timer"]);

interface CalendarProps {
  navigation: ProfileScreenNavigationProp;
  toggleCalendarOpen: () => void;
  setCalendarEvents: (events: Event[]) => void;
  setPublicEvents: (events: Event[]) => void;
  calendarOpen: boolean;
  currentDate: Moment.Moment;
  calendarEvents: Event[];
  publicEventsFilter: EventFilter;
}

interface CalendarState {
  loading: boolean;
}

class Calendar extends Component<CalendarProps, CalendarState> {
  constructor(props: CalendarProps) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    const events = await collectCalendarEvents();
    const publicEvents = await collectPublicEvents(
      this.props.publicEventsFilter
    );
    this.props.setCalendarEvents(events);
    this.props.setPublicEvents(publicEvents);
    this.setState({ loading: false });
  }

  goToEventDetails = (event: any) => {
    if (this.props.calendarOpen) {
      this.closeCalendarIfOpen();
    } else {
      let editEvent: Event = { ...event };

      // Moments can't be passed through params, need to be serialized
      editEvent.start_time = event.start_time.toISOString();
      editEvent.end_time = event.end_time.toISOString();

      this.props.navigation.navigate("EventDetails", {
        event: editEvent,
        onDeleteNavigateTo: "Calendar",
      });
    }
  };

  /**
   * Closes the calendar when the user
   * begins scrolling if its open.
   */
  closeCalendarIfOpen = (evt?) => {
    if (this.props.calendarOpen) {
      this.props.toggleCalendarOpen();
    }
    return false;
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CalendarView
          currentDate={this.props.currentDate}
          events={this.props.calendarEvents}
          onTapEvent={this.goToEventDetails}
          onTapOrVerticalDrag={this.closeCalendarIfOpen}
        />
        <LoadingOverlay visible={this.state.loading} />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { calendarEvents, publicEventsFilter } = state.events;
  const { calendarOpen, currentDate } = state.calendar;
  return {
    calendarEvents,
    calendarOpen,
    currentDate,
    publicEventsFilter,
  };
};

const mapDispatchToProps = {
  toggleCalendarOpen,
  setCalendarEvents,
  setPublicEvents,
};

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$white",
  },
  eventLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
