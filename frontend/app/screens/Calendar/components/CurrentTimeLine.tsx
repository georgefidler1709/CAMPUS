import React from "react";
import { View, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import moment from "moment";
import { Values } from "../../../constants";

interface CurrentTimeLineProps {
  currentDate: moment.Moment;
}

interface CurrentTimeLineState {
  now: moment.Moment;
}

class CurrentTimeLine extends React.Component<
  CurrentTimeLineProps,
  CurrentTimeLineState
> {
  constructor(props: CurrentTimeLineProps) {
    super(props);
    this.state = {
      now: moment(),
    };
  }

  /**
   * Refresh this.state.now every 2 minutes so the line
   * continues moving
   */
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ now: moment() });
    }, 120000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /**
   * Only render the line if the current date viewed on the calendar is today's date
   */
  render() {
    const { now } = this.state;
    if (this.props.currentDate.isSame(now, "day")) {
      let midnight = this.props.currentDate.clone();
      midnight.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      const duration = moment.duration(now.diff(midnight));
      let hours = duration.asHours();
      const top = hours * Values.HeightOfHour + 6;

      return (
        <View style={[styles.container, { top }]} pointerEvents="none">
          <View style={styles.circle} />
          <View style={styles.line} />
        </View>
      );
    } else {
      return null;
    }
  }
}

export default CurrentTimeLine;

const styles = EStyleSheet.create({
  container: {
    width: "88%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    position: "absolute",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "$primaryDarkBlue",
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "$primaryDarkBlue",
  },
});
