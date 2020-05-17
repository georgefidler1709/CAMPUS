import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";

import EStyleSheet from "react-native-extended-stylesheet";
import { Icon } from "react-native-elements";
import { Colors } from "../../constants";
import Dimensions from "../../styles/Dimensions";
import HeaderContainer from "./HeaderContainer";
import { HeaderButton } from "../Buttons";
import { Calendar } from "react-native-calendars";
import { connect } from "react-redux";
import {
  setCurrentDate,
  toggleCalendarOpen,
} from "../../reduxstore/actions/calendar";
import moment from "moment";

const AnimatedHeaderContainer = Animated.createAnimatedComponent(
  HeaderContainer
);

interface CalendarHeaderProps {
  style: Object;
  title: string;
  onPressPlus: () => void;
  currentDate: moment.Moment;
  calendarOpen: boolean;
  setCurrentDate: (date: moment.Moment) => void;
  toggleCalendarOpen: () => void;
}

interface CalendarHeaderState {
  calendarVisible: boolean;
  calendarOpacity: Animated.Value;
  headerHeight: Animated.Value;
  dropdownArrowRotation: Animated.Value;
}

class CalendarHeader extends Component<
  CalendarHeaderProps,
  CalendarHeaderState
> {
  constructor(props: CalendarHeaderProps) {
    super(props);
    this.state = {
      calendarVisible: false,
      calendarOpacity: new Animated.Value(0),
      headerHeight: new Animated.Value(120),
      dropdownArrowRotation: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps: CalendarHeaderProps) {
    if (this.props.calendarOpen !== prevProps.calendarOpen) {
      this.toggleCalendarView();
    }
  }

  /**
   * Set the date in redux based on the date picked in the calendar component
   */
  setDate = ({ dateString }) => {
    const date = moment(dateString, "YYYY-MM-DD");
    this.props.setCurrentDate(date);
  };

  /**
   * Animate the opening and closing of the calendar
   */
  toggleCalendarView = () => {
    if (!this.state.calendarVisible) {
      this.setState({ calendarVisible: true });

      Animated.parallel([
        Animated.timing(this.state.dropdownArrowRotation, {
          toValue: 180,
          duration: 400,
        }),
        Animated.timing(this.state.headerHeight, {
          toValue: 465,
          duration: 400,
        }),
        Animated.timing(this.state.calendarOpacity, {
          toValue: 1,
          duration: 500,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(this.state.dropdownArrowRotation, {
          toValue: 0,
          duration: 400,
        }),
        Animated.timing(this.state.headerHeight, {
          toValue: 120,
          duration: 400,
        }),
        Animated.timing(this.state.calendarOpacity, {
          toValue: 0,
          duration: 200,
        }),
      ]).start(() => {
        this.setState({ calendarVisible: false });
      });
    }
  };

  /**
   * Will display the date based on whether it is the current
   * year or not. If current year, no year will be displayed,
   * and the full month name will be displayed. Any other year,
   * and the year will be displayed along with an abbreviated
   * month. This is what Google Calendar does.
   */
  displayDate = () => {
    const date = this.props.currentDate;
    const day = date.format("ddd");
    if (date.year() === moment().year()) {
      return [day, date.format("D MMMM")];
    } else {
      return [day, date.format("D MMM YYYY")];
    }
  };

  setDateOnMonthChange = ({ dateString }) => {
    const date = moment(dateString, "YYYY-MM-DD").date(1);
    this.props.setCurrentDate(date);
  };

  render() {
    const selectedDate = this.props.currentDate.format("YYYY-MM-DD");
    const [day, date] = this.displayDate();
    return (
      <AnimatedHeaderContainer
        style={[this.props.style, { height: this.state.headerHeight }]}
        extraComponent={
          this.state.calendarVisible ? (
            <Animated.View style={{ opacity: this.state.calendarOpacity }}>
              <Calendar
                current={selectedDate}
                onDayPress={this.setDate}
                onMonthChange={this.setDateOnMonthChange}
                markedDates={{
                  [selectedDate]: { selected: true },
                }}
                theme={{
                  selectedDayBackgroundColor: Colors.PrimaryLightBlue,
                  arrowColor: Colors.PrimaryLightBlue,
                  monthTextColor: Colors.PrimaryDarkBlue,
                  todayTextColor: Colors.PrimaryLightBlue,
                  dayTextColor: Colors.PrimaryDarkBlue,
                }}
              />
            </Animated.View>
          ) : null
        }
      >
        <TouchableWithoutFeedback onPress={this.props.toggleCalendarOpen}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateStyle}>
              <Text style={{ fontWeight: "500" }}>{day}</Text> {date}
            </Text>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: this.state.dropdownArrowRotation.interpolate({
                      inputRange: [0, 180],
                      outputRange: ["0deg", "-180deg"],
                    }),
                  },
                ],
              }}
            >
              <Icon
                type="material"
                name="arrow-drop-down"
                color={Colors.PrimaryDarkBlue}
                size={28}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.touchableButtonArea, { marginRight: 6 }]}
            onPress={() => this.props.setCurrentDate(moment())}
          >
            <Icon
              type="material"
              name="today"
              color={Colors.PrimaryDarkBlue}
              size={30}
            />
          </TouchableOpacity>
          <HeaderButton
            onPress={this.props.onPressPlus}
            style={{ marginRight: 15 }}
            iconType="material-community"
            iconName="plus"
          />
        </View>
      </AnimatedHeaderContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const { currentDate, calendarOpen } = state.calendar;
  return {
    currentDate,
    calendarOpen,
  };
};

const mapDispatchToProps = {
  setCurrentDate,
  toggleCalendarOpen,
};

export default connect(mapStateToProps, mapDispatchToProps)(CalendarHeader);

const styles = EStyleSheet.create({
  dateContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  dateStyle: {
    color: "$primaryDarkBlue",
    fontSize: 22,
    fontWeight: "400",
    marginLeft: 25,
  },
  buttonContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  touchableButtonArea: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
