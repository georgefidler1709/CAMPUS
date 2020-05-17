import React, { Component } from "react";
import { View, Text, TouchableHighlight } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import moment from "moment";
import { Values } from "../../../constants";
import { InviteResponse, Category } from "../../../types/events";
import { GetCalendarItemColor } from "../../../modules";

interface EventItemProps {
  topOffset: number;
  categories: Category[];
  title: string;
  rsvpStatus: InviteResponse | null;
  locationName: string | undefined;
  start: string;
  end: string;
  onPress: () => void;
}

interface EventItemState {
  containerHeight: number;
}

class EventItem extends Component<EventItemProps, EventItemState> {
  constructor(props: EventItemProps) {
    super(props);
    this.state = {
      containerHeight: 0,
    };
  }

  componentDidMount() {
    this.setContainerHeight();
  }

  /**
   * If this event has a new start or end time, re-render its height
   *
   * @param prevProps
   */
  componentDidUpdate(prevProps: EventItemProps) {
    if (
      prevProps.start !== this.props.start ||
      prevProps.end !== this.props.end
    ) {
      this.setContainerHeight();
    }
  }

  /**
   * Set the height of the event item based on the start and end time
   */
  setContainerHeight = () => {
    const start = moment(this.props.start);
    const end = moment(this.props.end);
    const duration = moment.duration(end.diff(start));
    const containerHeight = duration.asHours() * Values.HeightOfHour;
    this.setState({ containerHeight });
  };

  render() {
    const backgroundColor = GetCalendarItemColor(this.props.categories);

    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        underlayColor={backgroundColor}
        style={[
          styles.container,
          {
            height: this.state.containerHeight,
            top: this.props.topOffset,
            backgroundColor: backgroundColor,
            opacity:
              this.props.rsvpStatus !== InviteResponse.ATTENDING ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{this.props.title}</Text>
          {this.props.locationName && (
            <Text style={styles.locationName}>{this.props.locationName}</Text>
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

export default EventItem;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 7,
  },
  title: {
    color: "$white",
    fontSize: 13,
    fontWeight: "600",
  },
  locationName: {
    marginTop: 3,
    color: "$white",
    fontSize: 12,
    fontWeight: "400",
  },
});
