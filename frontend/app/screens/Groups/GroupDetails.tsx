import * as React from "react";
import { View, SafeAreaView, Text, Alert } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import GenericHeader from "../../components/Headers/GenericHeader";
import { RouteProp } from "@react-navigation/native";
import HeaderButton from "../../components/Buttons/HeaderButton";
import moment from "moment";
import { Colors } from "../../constants";
import { ListItem, Icon, ButtonGroup, Button } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { connect } from "react-redux";
import { Group, GroupStatus, GroupItem, UpdateGroup } from "../../types/groups";
import { CalendarView } from "../Calendar/components";
import { CircleImage } from "../../components/Images";
import {
  subscribeToGroup,
  deleteGroup,
  getUserId,
  removeGroupMember,
  getGroup,
  unsubscribeFromGroup,
  collectUserGroups,
} from "../../api";
import { BorderButton } from "../../components/Buttons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { User, UserGroups } from "../../types/user";
import { setGroups } from "../../reduxstore/actions/groups";

interface GroupDetailsProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, GroupDetailsRouteProps>, string>;
  uid: string;
  setGroups: (groups: UserGroups) => void;
}

interface GroupDetailsRouteProps {
  group: GroupItem;
  groupStatus: GroupStatus;
  update?: boolean;
}

interface GroupDetailsState {
  selectedButtonIdx: number;
  groupStatus: GroupStatus;
  date: moment.Moment;
  group: Group;
  updated: boolean;
}

// Component to display the details for a single group 
class GroupDetails extends React.Component<
  GroupDetailsProps,
  GroupDetailsState
> {
  constructor(props: GroupDetailsProps) {
    super(props);
    this.state = {
      selectedButtonIdx: 0,
      groupStatus: GroupStatus.NONE,
      date: moment(),
      group: undefined,
      updated: false,
    };
  }

  // Header bar updates depending on the toggle button
  // i.e. if the user is viewing the group's calendar and they are a group member 
  // they can add an event to the group's calendar,
  // if they are viewing the group's info and they are a group member
  //  they can update the group info.
  updateHeaders = () => {
    const rightIcons =
      this.props.route.params.groupStatus === GroupStatus.MEMBER
        ? [
            <HeaderButton
              onPress={this.editGroup}
              style={{ marginRight: 15 }}
              iconType="material"
              iconName="mode-edit"
            />,
            <HeaderButton
              onPress={this.addEvent}
              style={{ marginRight: 15 }}
              iconType="material-community"
              iconName="plus"
            />,
          ]
        : [];

    this.props.navigation.setOptions({
      header: ({}) => {
        return (
          <GenericHeader
            leftElement={
              <HeaderButton
                onPress={
                  this.state.updated ? this.goBackAndUpdate : this.goBack
                }
                style={{ marginLeft: 10 }}
                iconType="material"
                iconName="arrow-back"
              />
            }
            rightElement={rightIcons[this.state.selectedButtonIdx]}
            style={{ height: 120 }}
          />
        );
      },
    });
  };

  updateGroup = async () => {
    const group = await getGroup(this.props.route.params.group.gid);
    this.setGroup(group);
  };

  // group status (i.e. what status the current user holds in the group 
  // (member, subscriber or none)) is loaded in from the Groups component.
  componentDidMount() {
    this.updateHeaders();
    this.setGroupStatus(this.props.route.params.groupStatus);
    this.updateGroup();
  }

  componentDidUpdate(prevProps: GroupDetailsProps) {
    if (this.props.route.params.update) {
      this.props.route.params.update = true;
      this.updateGroup();
    }

    this.updateHeaders();
  }

  setUpdated = (updated: boolean) => {
    this.setState({ updated });
  };

  setGroup = (group: Group) => {
    this.setState({ group });
  };

  setDate = (date: moment.Moment) => {
    this.setState({ date });
  };

  // used to load the screen showing the details of a specific event
  // if a group event is selected
  goToEventDetails = (event: any) => {
    let editEvent = { ...event };
    // Moments can't be passed through params, need to be serialized
    editEvent.start_time = event.start_time.toISOString();
    editEvent.end_time = event.end_time.toISOString();
    this.props.navigation.navigate("EventDetails", {
      event: editEvent,
      groupStatus: this.state.groupStatus,
      onDeleteNavigateTo: "Groups",
    });
  };

  // load screen for adding an event to group calendar
  addEvent = () => {
    this.props.navigation.navigate("AddGroupEvent", {
      mode: "create",
      gid: this.state.group?.gid,
    });
  };

  // load screen for editing the current group
  editGroup = () => {
    this.props.navigation.navigate("AddGroup", {
      mode: "edit",
      group: this.state.group,
      onUpdate: (updateGroupObject: UpdateGroup, updatedMembers: User[]) => {
        this.setState({
          group: {
            ...this.state.group,
            name: updateGroupObject.name,
            is_public: updateGroupObject.is_public,
            description: updateGroupObject.description,
            members: updatedMembers,
          },
        });
      },
    });
  };

  // format date from iso-8601 used in the db
  displayDate = () => {
    const date = this.state.date;
    const day = date.format("ddd");
    if (date.year() === moment().year()) {
      return [day, date.format("D MMMM")];
    } else {
      return [day, date.format("D MMM YYYY")];
    }
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  goBackAndUpdate = async () => {
    const groups = await collectUserGroups();
    this.props.setGroups(groups);
    this.props.navigation.goBack();
  };

  setSelectedButtonIdx = (selectedButtonIdx: number) => {
    this.setState({ selectedButtonIdx });
  };

  setGroupStatus = (groupStatus: GroupStatus) => {
    if (groupStatus !== this.state.groupStatus) {
      this.setState({ groupStatus });
    }
  };

  // subscribe the current user to this group
  subscribe = (group: Group) => {
    subscribeToGroup(group.gid);
    this.setGroupStatus(GroupStatus.SUBSCRIBER);
    this.setUpdated(true);
  };

  askLeaveGroup = () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => {
          this.leaveGroup();
        },
      },
    ]);
  };

  // remove the current user as a member from the group
  leaveGroup = () => {
    removeGroupMember(this.state.group!.gid, this.props.uid);
    this.setGroupStatus(GroupStatus.NONE);
    this.setUpdated(true);
  };

  // remove the current user as a subscriber from this group
  unsubscribe = () => {
    unsubscribeFromGroup(this.state.group!.gid);
    this.setGroupStatus(GroupStatus.NONE);
    this.setUpdated(true);
  };

  // delete this group (only possible if the user is a member)
  askDeleteGroup = (group: Group) => {
    Alert.alert("Delete Group", "Are you sure you want to delete this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => {
          this.deleteGroup(group);
        },
      },
    ]);
  };

  deleteGroup = async (group: Group) => {
    await deleteGroup(group.gid);
    this.goBackAndUpdate();
  };

  // use the list modal to display all the members of this group
  listGroupMembers = () => {
    this.props.navigation.navigate("ListModal", {
      items: this.state.group?.members,
      keyExtractor: (item: User, index: number) => item.uid + index,
      imgUri: require("../../assets/user-icon.png"),
      onPress: () => {},
      title: "Group Members",
    });
  };

  render() {
    const [day, date] = this.displayDate();
    const buttons = ["Group", "Calendar"];
    const { group, groupStatus } = this.state;

    return this.state.group ? (
      <SafeAreaView style={styles.container}>
        {/* Button group used to toggle between the group info and the group calendar */}
        <ButtonGroup
          onPress={this.setSelectedButtonIdx}
          selectedIndex={this.state.selectedButtonIdx}
          buttons={buttons}
        />

        {/* If the calendar is selected, display a calendar for the group
          * using the generic calendar view component so the calendar has
          * the same robust functionality as a user's personal calendar} 
          */
        }
        {buttons[this.state.selectedButtonIdx] === "Calendar" && (
          <>
            <CalendarView
              currentDate={this.state.date}
              events={group!.calendar ? group!.calendar : []}
              onTapEvent={this.goToEventDetails}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                onPress={() => this.setDate(this.state.date.subtract(1, "day"))}
                type="clear"
                icon={
                  <Icon
                    type="material"
                    name="keyboard-arrow-left"
                    size={25}
                    color={Colors.PrimaryDarkBlue}
                  />
                }
              />
              <Text style={styles.dateStyle}>
                <Text style={{ fontWeight: "500" }}>{day}</Text> {date}
              </Text>
              <Button
                onPress={() => this.setDate(this.state.date.add(1, "day"))}
                type="clear"
                icon={
                  <Icon
                    type="material"
                    name="keyboard-arrow-right"
                    size={25}
                    color={Colors.PrimaryDarkBlue}
                  />
                }
              />
            </View>
          </>
        )}

        {/* If the calendar is not selected, display detailed
          * info on the current group such as #members, #subscribers, description
          * and allow the user to update their status with the group
          */
        }
        {buttons[this.state.selectedButtonIdx] === "Group" && (
          <View style={styles.container}>
            <View style={styles.blankSpace}></View>
            <View style={styles.leftAlignContainer}>
              <View style={styles.itemContainer}>
                <CircleImage
                  uri={require("../../assets/group-icon.jpg")}
                  size={60}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 20, width: Dimensions.width * 0.8 }}>
                  {group!.name}
                </Text>
              </View>
              {this.state.group.description !== "" && (
                <View style={styles.itemContainer}>
                  <Icon type="material" name="subject" size={25} />
                  <Text style={{ marginLeft: 10 }}>
                    {this.state.group.description}
                  </Text>
                </View>
              )}

              {group!.is_public && group!.subscribers && (
                <View style={styles.itemContainer}>
                  <Icon type="font-awesome" name="users" size={20} />
                  <Text style={{ marginLeft: 10 }}>
                    {`Subscribers: ${group!.subscribers.length}`}
                  </Text>
                </View>
              )}

              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.LightGrey,
                  marginBottom: 20,
                }}
              />
              <View
                style={{ flexDirection: "row", justifyContent: "flex-start" }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <Icon type="material" name="supervisor-account" size={25} />
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      marginLeft: 10,
                      marginTop: 4,
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>{`Members: ${
                      group!.members.length
                    }`}</Text>
                    {group!.members.slice(0, 5).map((member, i) => (
                      <Text key={i}>{member.name}</Text>
                    ))}
                    {group!.members.length > 5 && (
                      <TouchableWithoutFeedback
                        onPress={() => {
                          this.listGroupMembers();
                        }}
                      >
                        <Text style={{ color: Colors.PrimaryLightBlue }}>{`${
                          group!.members.length - 5
                        } more...`}</Text>
                      </TouchableWithoutFeedback>
                    )}
                  </View>
                </View>
              </View>
            </View>
            {groupStatus === GroupStatus.NONE && (
              <BorderButton
                title={"Subscribe"}
                buttonStyle={{ marginBottom: 30, borderRadius: 5 }}
                color={Colors.PrimaryLightBlue}
                iconProps={{
                  name: "add-alert",
                }}
                onPress={() => this.subscribe(this.state.group!)}
              />
            )}
            {groupStatus === GroupStatus.SUBSCRIBER && (
              <BorderButton
                title={"Unsubscribe"}
                buttonStyle={{ marginBottom: 30, borderRadius: 5 }}
                iconProps={{
                  name: "notifications-off",
                }}
                color={Colors.Red}
                onPress={() => this.unsubscribe()}
              />
            )}
            {groupStatus === GroupStatus.MEMBER && (
              <>
                <BorderButton
                  title={"Leave Group"}
                  color={Colors.Red}
                  iconProps={{
                    type: "material",
                    name: "exit-to-app",
                  }}
                  onPress={() => this.askLeaveGroup()}
                  buttonStyle={{
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                />

                <Button
                  title={"Delete Group"}
                  containerStyle={{
                    marginBottom: 30,
                    width: Dimensions.width * 0.85,
                  }}
                  buttonStyle={{
                    backgroundColor: Colors.Red,
                    borderRadius: 0,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                  }}
                  onPress={() => this.askDeleteGroup(this.state.group!)}
                  icon={{
                    name: "delete-forever",
                    color: "white",
                  }}
                  iconRight={true}
                />
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    ) : null;
  }
}

const mapStateToProps = (state) => {
  const { uid } = state.auth;
  return {
    uid,
  };
};

const mapDispatchToProps = {
  setGroups,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    height: Dimensions.height,
  },
  blankSpace: {
    width: Dimensions.width,
    height: 20,
  },
  leftAlignContainer: {
    width: Dimensions.width * 0.9,
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 20,
    width: Dimensions.width * 0.9,
  },
  dateStyle: {
    color: Colors.PrimaryDarkBlue,
    fontSize: 22,
    fontWeight: "400",
  },
});
