import * as React from "react";
import { View, TouchableHighlight, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import Dimensions from "../../styles/Dimensions";
import { CircleImage } from "../Images";
import Moment from "moment";
import { extendMoment } from "moment-range";

const moment = extendMoment(Moment);

interface MainListItemProps {
  onPress: (arg?: any) => void;
  rightElement: React.ReactNode;
  title: string;
  description: string;
  imgUri: string;
  times?: TimeProp;
  containerStyle?: object;
}

interface TimeProp {
  startTime: string;
  endTime: string;
}

export default (props: MainListItemProps) => {
  var startText = "";
  var endText = "";

  if (props.times) {
    const now = moment();
    const startTime = moment(props.times.startTime);
    const endTime = moment(props.times.endTime);
    const eventRange = moment.range(startTime, endTime);

    endText = endTime.format("h:mmA");
    if (now.within(eventRange)) {
      startText = "Now";
    } else {
      startText = startTime.format("h:mmA");
    }
  }

  return (
    <TouchableHighlight
      style={{ ...styles.touchableArea, ...props.containerStyle }}
      onPress={props.onPress}
      underlayColor="#EEE"
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <CircleImage uri={props.imgUri} size={70} style={null} />
          <View style={styles.infoContainer}>
            <Text style={styles.titleStyle} numberOfLines={1}>
              {props.title}
            </Text>
            {props.description !== "" && (
              <Text style={styles.descriptionStyle} numberOfLines={1}>
                {props.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightContainer}>
          {props.times && (
            <Text style={styles.timestampStyle}>
              {startText} - {endText}
            </Text>
          )}
          {props.rightElement}
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = EStyleSheet.create({
  touchableArea: {
    width: "100%",
    height: 95,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "white",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.width - 13,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 13,
  },
  infoContainer: {
    marginLeft: 13,
  },
  titleStyle: {
    fontSize: 15,
    fontWeight: "500",
    color: "$primaryDarkBlue",
  },
  descriptionStyle: {
    fontSize: 11,
    fontWeight: "400",
    color: "$primaryDarkBlue",
    marginTop: 2,
  },
  timestampStyle: {
    fontSize: 10,
    fontWeight: "500",
    color: "$primaryDarkBlue",
    marginRight: 8,
  },
});
