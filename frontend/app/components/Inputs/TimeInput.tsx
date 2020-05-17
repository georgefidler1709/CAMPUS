import * as React from "react";
import {
  View,
  Text,
  TouchableHighlight,
  Animated,
  Platform,
} from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

interface TimeInputProps {
  date: moment.Moment;
  calendarVisible: boolean;
  onChangeDate: (event: any, date: any) => void;
  onPress: () => void;
}

interface TimeInputState {
  mode: "date" | "time" | "datetime" | "countdown";
  timeContainerHeight: number;
  pickerContainerHeight: number;
  containerHeight: Animated.Value;
  pickerOpacity: Animated.Value;
  calendarVisible: boolean;
}

class TimeInput extends React.Component<TimeInputProps, TimeInputState> {
  constructor(props: TimeInputProps) {
    super(props);
    this.state = {
      mode: "time",
      timeContainerHeight: 0,
      pickerContainerHeight: 0,
      containerHeight: new Animated.Value(0),
      pickerOpacity: new Animated.Value(0),
      calendarVisible: props.calendarVisible,
    };
  }

  componentDidUpdate(prevProps: TimeInputProps) {
    if (prevProps.calendarVisible !== this.props.calendarVisible) {
      this.setState({ calendarVisible: this.props.calendarVisible });
      if (Platform.OS === "ios") {
        if (this.props.calendarVisible) {
          this.openCalendar();
        } else if (!this.props.calendarVisible) {
          this.closeCalendar();
        }
      }
    }
  }

  switchMode = (mode: TimeInputState["mode"]) => {
    this.setState({ mode });
  };

  setTimeContainerHeight = (event) => {
    this.setState({
      timeContainerHeight: event.nativeEvent.layout.height,
    });
    this.state.containerHeight.setValue(event.nativeEvent.layout.height);
  };

  setPickerContainerHeight = (event) => {
    this.setState(
      { pickerContainerHeight: event.nativeEvent.layout.height },
      () => this.openCalendar()
    );
  };

  openCalendar = () => {
    Animated.parallel([
      Animated.timing(this.state.containerHeight, {
        toValue:
          this.state.timeContainerHeight + this.state.pickerContainerHeight,
        duration: 350,
      }),
      Animated.timing(this.state.pickerOpacity, {
        toValue: 1,
        duration: 350,
      }),
    ]).start();
  };

  closeCalendar = () => {
    Animated.parallel([
      Animated.timing(this.state.containerHeight, {
        toValue: this.state.timeContainerHeight,
        duration: 350,
      }),
      Animated.timing(this.state.pickerOpacity, {
        toValue: 0,
        duration: 0,
      }),
    ]).start();
  };

  render() {
    const day = this.props.date.format("ddd");
    const date = this.props.date.format("D MMM");
    const time = this.props.date.format("h:mmA");

    if (Platform.OS === "ios") {
      return (
        <Animated.View style={{ height: this.state.containerHeight }}>
          <TouchableHighlight underlayColor="#eee" onPress={this.props.onPress}>
            <View
              style={styles.subContainer}
              onLayout={this.setTimeContainerHeight}
            >
              <View style={styles.dateContainer}>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>{day}</Text> {date}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.text}>{time}</Text>
              </View>
            </View>
          </TouchableHighlight>
          {this.state.calendarVisible && (
            <Animated.View
              style={{ opacity: this.state.pickerOpacity }}
              onLayout={this.setPickerContainerHeight}
            >
              <DateTimePicker
                value={this.props.date.toDate()}
                minuteInterval={15}
                mode="datetime"
                onChange={this.props.onChangeDate}
              />
            </Animated.View>
          )}
        </Animated.View>
      );
    } else {
      return (
        <View style={styles.subContainer}>
          <TouchableHighlight
            underlayColor="#eee"
            onPress={() => {
              this.switchMode("date");
              this.props.onPress();
            }}
            style={styles.dateContainerAndroid}
          >
            <Text style={styles.text}>
              <Text style={styles.boldText}>{day}</Text> {date}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="#eee"
            onPress={() => {
              this.switchMode("time");
              this.props.onPress();
            }}
            style={styles.timeContainerAndroid}
          >
            <Text style={styles.text}>{time}</Text>
          </TouchableHighlight>
          {this.state.calendarVisible && (
            <DateTimePicker
              value={this.props.date.toDate()}
              minuteInterval={15}
              mode={this.state.mode}
              onChange={(event, date) => {
                this.setState({ calendarVisible: false });
                this.props.onChangeDate(event, date);
              }}
            />
          )}
        </View>
      );
    }
  }
}

export default TimeInput;

const styles = EStyleSheet.create({
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    height: 40,
  },
  text: {
    color: "$primaryDarkBlue",
    fontWeight: "300",
  },
  boldText: {
    fontWeight: "500",
  },
  timeContainer: {
    height: "100%",
    paddingLeft: 20,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  dateContainer: {
    height: "100%",
    paddingRight: 20,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  timeContainerAndroid: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  dateContainerAndroid: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
