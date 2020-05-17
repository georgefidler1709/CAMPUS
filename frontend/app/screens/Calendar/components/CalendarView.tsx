import React, { Component } from "react";
import { View, ScrollView, Animated } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import HourLine from "./HourLine";
import EventsContainer from "./EventsContainer";
import EventItem from "./EventItem";
import CurrentTimeLine from "./CurrentTimeLine";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { Values } from "../../../constants";
import Dimensions from "../../../styles/Dimensions";
import _ from "lodash";
import { Event } from "../../../types/events";

const moment = extendMoment(Moment);

interface CalendarProps {
  currentDate: Moment.Moment;
  events: Event[];
  onTapEvent?: (event: any) => void;
  onTapOrVerticalDrag?: () => void;
}

interface CalendarState {
  timestamps: Moment.Moment[];
  eventViewConfig: [Event[]] | undefined;
  offset: Animated.Value;
}

class Calendar extends Component<CalendarProps, CalendarState> {
  constructor(props: CalendarProps) {
    super(props);
    this.state = {
      timestamps: [],
      eventViewConfig: undefined,
      offset: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    let timestamps = [];
    for (let i = 0; i < 24; i++) {
      timestamps.push(moment(i, "HH"));
    }

    this.setState({ timestamps });
    this.renderEvents();
  }

  /**
   * Animate the calendar view to move forwards if the new date is after
   * the previous date, and backwards if the new date is before the
   * previous date
   *
   * @param prevProps
   */
  componentDidUpdate(prevProps: CalendarProps) {
    if (prevProps !== this.props) {
      this.renderEvents();

      if (!prevProps.currentDate.isSame(this.props.currentDate, "day")) {
        let offset = 0;

        if (this.props.currentDate.isAfter(prevProps.currentDate, "day")) {
          offset = Dimensions.width;
        } else if (
          this.props.currentDate.isBefore(prevProps.currentDate, "day")
        ) {
          offset = -Dimensions.width;
        }

        this.state.offset.setValue(offset);
        Animated.timing(this.state.offset, {
          toValue: 0,
          duration: 150,
        }).start();
      }
    }
  }

  /**
   * Take the array of public events from redux, and organise them into a container
   * to render properly on the calendar. This is necessary for events to dynamically
   * narrow in width if they overlap
   */
  renderEvents = () => {
    let eventViewConfig = [];
    const events: any[] = [...this.props.events];

    // Convert the date strings to a moment.js object
    events.forEach((event) => {
      event.start_time = moment(event.start_time);
      event.end_time = moment(event.end_time);
    });

    let eventsSorted = _.sortBy(events, ["start_time"]);

    _.remove(eventsSorted, (event) => {
      return (
        !this.props.currentDate.isSame(event.start_time, "day") &&
        !this.props.currentDate.isSame(event.end_time, "day")
      );
    });

    // Sort events into groups. Any events that overlap with each other
    // will be placed in their own group
    let eventViewRow = [];
    while (eventsSorted.length !== 0) {
      const event = eventsSorted.splice(0, 1)[0];

      // This is the first event
      if (eventViewRow.length === 0) {
        eventViewRow.push(event);
        continue;
      }

      const eventRange = moment.range(event.start_time, event.end_time);

      let overlaps = false;
      for (let i = 0; i < eventViewRow.length; i++) {
        const prevEventRange = moment.range(
          eventViewRow[i].start_time,
          eventViewRow[i].end_time
        );
        if (eventRange.overlaps(prevEventRange)) {
          overlaps = true;
          break;
        }
      }

      // If this event doesn't overlap with the previous event, then
      // start a new event group
      if (!overlaps) {
        eventViewConfig.push(eventViewRow);
        eventViewRow = [];
      }
      eventViewRow.push(event);
    }

    // Push the remaining event group up to the config
    if (eventViewRow.length > 0) {
      eventViewConfig.push(eventViewRow);
    }

    this.setState({ eventViewConfig });
  };

  render() {
    let midnight = this.props.currentDate.clone();
    midnight.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.container, { left: this.state.offset }]}
          onStartShouldSetResponder={this.props.onTapOrVerticalDrag}
        >
          <ScrollView onScrollBeginDrag={this.props.onTapOrVerticalDrag}>
            {this.state.timestamps.map((item, i) => (
              <HourLine timestamp={item.format("ha")} key={i} />
            ))}
            {this.state.eventViewConfig !== undefined &&
              this.state.eventViewConfig.map((eventGroup, i) => {
                const startTime = eventGroup[0].start_time;
                const duration = moment.duration(startTime.diff(midnight));
                let hours = duration.asHours();
                const topOffset = hours * Values.HeightOfHour + 10;
                return (
                  <EventsContainer topOffset={topOffset} key={i}>
                    {eventGroup.map((event, j) => {
                      const eventStartTime = event.start_time;
                      const diff = moment
                        .duration(eventStartTime.diff(startTime))
                        .asHours();
                      const top = diff * Values.HeightOfHour;
                      return (
                        <EventItem
                          onPress={() => {
                            if (this.props.onTapEvent !== undefined) {
                              this.props.onTapEvent(event);
                            }
                          }}
                          topOffset={top}
                          categories={event.categories}
                          title={event.name}
                          rsvpStatus={event.user_rsvp?.response}
                          locationName={event.location?.name}
                          start={event.start_time}
                          end={event.end_time}
                          key={j}
                        />
                      );
                    })}
                  </EventsContainer>
                );
              })}
            <CurrentTimeLine currentDate={this.props.currentDate} />
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
}

export default Calendar;

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
