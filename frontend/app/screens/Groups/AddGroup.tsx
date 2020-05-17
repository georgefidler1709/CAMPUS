import React, { Component } from "react";
import { View, Text, SafeAreaView, ScrollView, Switch } from "react-native";
import EStyleSheet, { create } from "react-native-extended-stylesheet";
import {
  CrossButton,
  BlueTextButton,
  Switcher,
} from "../../components/Buttons";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import ModalHeader from "../../components/Headers/ModalHeader";
import { CircleImage } from "../../components/Images";
import { TitleInput, DetailsInput, TimeInput } from "../../components/Inputs";
import { connect } from "react-redux";
import { User, UserGroups } from "../../types/user";
import { Group, UpdateGroup } from "../../types/groups";
import { RouteProp } from "@react-navigation/native";
import Dimensions from "../../styles/Dimensions";
import Colors from "../../constants/Colors";
import { Icon, Input, ListItem } from "react-native-elements";
import {
  createGroup,
  searchUsers,
  removeGroupMember,
  addGroupMember,
  updateGroup,
  collectUserGroups,
} from "../../api";
import { setGroups } from "../../reduxstore/actions/groups";
import { setSearchQuery } from "../../reduxstore/actions/users";

interface AddGroupProps {
  route: RouteProp<Record<string, AddGroupRouteProps>, string>;
  navigation: ProfileScreenNavigationProp;
  setGroups: (groups: UserGroups) => void;
  setSearchQuery: (s: string) => void;
  searchQuery: string;
}

interface AddGroupRouteProps {
  mode: "create" | "edit";
  group: Group;
  onUpdate: (group: UpdateGroup, members: User[]) => void;
}

interface AddGroupState {
  newGroup: UpdateGroup;
  mode: "create" | "edit";
  members: User[];
}

// Component used for creating a new group or editing a pre-existing group
class AddGroup extends Component<AddGroupProps, AddGroupState> {
  constructor(props: AddGroupProps) {
    super(props);
    this.state = {
      newGroup: {
        name: "",
        description: "",
        is_public: true,
      },
      mode: "create",
      members: [],
    };
  }

  // on mount load in existing details for the group
  // if editing, otherwise start with blank details
  componentDidMount() {
    const { mode, group } = this.props.route.params;
    if (mode === "edit") {
      let { name, description, is_public, members } = group;

      this.setState({
        mode,
        newGroup: {
          ...this.state.newGroup,
          name,
          description,
          is_public,
        },
        members: members,
      });
    }
  }

  goBack = () => {
    this.props.navigation.goBack();
  };

  // tell the groups component to update
  // as a new group has been added
  goBackAndUpdate = async () => {
    const groups = await collectUserGroups();
    this.props.setGroups(groups);
    if (this.state.mode === "edit") {
      this.props.route.params.onUpdate(this.state.newGroup, this.state.members);
    }
    this.props.navigation.goBack();
  };

  // generic state updating function used for
  // updating strings that are part of the group's info
  // (e.g. title, description)
  onChangeText = (key: string, text: string) => {
    this.setState({
      newGroup: {
        ...this.state.newGroup,
        [key]: text,
      },
    });
  };

  setPublicGroup = (is_public: boolean) => {
    this.setState({
      newGroup: {
        ...this.state.newGroup,
        is_public: is_public,
      },
    });
  };

  setMembers = (members: User[]) => {
    this.setState({ members });
  };

  // if the user saves the group then add it to the db
  // and show the group in the user's groups list
  onSave = async() => {
    // const newGroup: Group = this.state.newGroup;

    if (this.state.mode === "create") {
      await createGroup(this.state.newGroup);
      this.goBackAndUpdate();
    } else {
      await updateGroup(this.props.route.params.group.gid, this.state.newGroup);
      this.goBackAndUpdate();
    }
  };

  // remove a member from a group
  removeMember = (member: User, memberIdx: number) => {
    removeGroupMember(this.props.route.params.group.gid, member.uid);

    const newMembers = this.state.members.filter((_, i) => i != memberIdx);
    this.setMembers(newMembers);
  };

  // add new user to a group
  addUserToGroup = (
    user: User,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    addGroupMember(this.props.route.params.group.gid, user.uid);
    this.setMembers([...this.state.members, user]);
    searchModalNavigation.goBack();
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ alignItems: "center" }}>
          <SafeAreaView style={styles.subContainer}>
            <ModalHeader
              title={
                this.state.mode === "create" ? "Create Group" : "Edit Group"
              }
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
                  active={this.state.newGroup.name}
                />
              }
            />
            <CircleImage
              style={{ marginTop: "6%" }}
              uri={require("../../assets/group-icon.jpg")}
              size={95}
            />
            <TitleInput
              containerStyle={{ marginTop: 25, marginBottom: 10 }}
              onChangeText={(text: string) => this.onChangeText("name", text)}
              value={this.state.newGroup.name}
            />
            <DetailsInput
              placeholder="Add description"
              value={this.state.newGroup.description}
              onChangeText={(text: string) =>
                this.onChangeText("description", text)
              }
              iconType="material-community"
              iconName="text"
              multiline
            />

            <Switcher
              label="Public Group"
              onToggleSwitch={() =>
                this.setPublicGroup(!this.state.newGroup.is_public)
              }
              value={this.state.newGroup.is_public}
            />
            {this.props.route.params.mode === "edit" && (
              <View
                style={{
                  width: Dimensions.width * 0.85,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-start" }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Icon type="material" name="supervisor-account" size={25} />
                    <ScrollView
                      style={{
                        flexDirection: "column",
                        marginLeft: 10,
                        marginTop: 4,
                      }}
                      contentContainerStyle={{ alignItems: "flex-start" }}
                    >
                      <Text
                        style={{ fontWeight: "bold" }}
                      >{`Members: ${this.state.members.length}`}</Text>
                      {this.state.members.map((member, i) => (
                        <View style={{ flexDirection: "row" }} key={i}>
                          <Text style={{ marginRight: 5 }}>{member.name}</Text>
                          <Icon
                            type="material"
                            name="close"
                            onPress={() => {
                              this.removeMember(member, i);
                            }}
                            size={15}
                          />
                        </View>
                      ))}
                      <BlueTextButton
                        containerStyle={{
                          //height: Dimensions.height * 0.02,
                          fontWeight: "bold",
                        }}
                        text="Add People"
                        textSize={13}
                        onPress={() =>
                          this.props.navigation.navigate("SearchModal", {
                            onItemSelect: this.addUserToGroup,
                            searchQueryInit: this.props.searchQuery,
                            setSearchQueryExternal: this.props.setSearchQuery,
                            searchItems: searchUsers,
                            leftIconProps: { name: "person", type: "material" },
                          })
                        }
                        active={true}
                      />
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }
}

const AddGroupContainer = connect(
  (state) => ({
    searchQuery: state.users.searchQuery,
  }),
  { setGroups, setSearchQuery }
)(AddGroup);

export default AddGroupContainer;

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
  leftAlignContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: Dimensions.width * 0.85,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGrey,
    marginBottom: 15,
  },
  member: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: Dimensions.width * 0.4,
  },
});
