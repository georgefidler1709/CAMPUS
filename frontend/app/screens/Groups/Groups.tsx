import React, { Component } from "react";
import { View, Text, ScrollView, SectionList } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { RouteProp } from "@react-navigation/native";
import {
  MainListItem,
  FakeSearchBarButton,
  TopListButton,
} from "../../components/Buttons";
import { Icon, Button } from "react-native-elements";
import { Colors } from "../../constants";
import { Group, GroupStatus, GroupItem } from "../../types/groups";
import { collectUserGroups, searchPublicGroups } from "../../api";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { connect } from "react-redux";
import { UserGroups, User } from "../../types/user";
import { setGroups, setSearchQuery } from "../../reduxstore/actions/groups";
import { LoaderOverlay } from "../../components/Modal";
import { SectionHeader } from "../../components/Titles";
import Dimensions from "../../styles/Dimensions";
import _ from "lodash";

interface GroupsState {
  loading: boolean;
  refreshing: boolean;
}

interface GroupsRouteProps {
  update?: boolean;
}

interface GroupsProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, GroupsRouteProps>, string>;
  groups: UserGroups;
  searchQuery: string;
  setGroups: (groups: UserGroups) => void;
  setSearchQuery: (s: string) => void;
}

class Groups extends Component<GroupsProps, GroupsState> {
  constructor(props: GroupsProps) {
    super(props);

    this.state = {
      loading: true,
      refreshing: false,
    };
  }

  async componentDidMount() {
    await this.getGroups();
    this.setState({ loading: false });
  }

  async componentDidUpdate() {
    if (this.props.route.params && this.props.route.params.update) {
      this.props.route.params.update = false;
      this.getGroups();
    }
  }

  getGroups = async () => {
    const groups = await collectUserGroups();
    this.props.setGroups(groups);
  };

  searchToGroupDetails = (
    group: GroupItem,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    searchModalNavigation.navigate("GroupDetails", {
      group: group,
      groupStatus: this.getGroupStatus(group.gid),
    });
  };

  getGroupStatus = (gid: string) => {
    const { groups, subscriptions } = this.props.groups;
    if (groups.filter((group) => group.gid === gid).length)
      return GroupStatus.MEMBER;
    if (subscriptions.filter((group) => group.gid === gid).length)
      return GroupStatus.SUBSCRIBER;
    return GroupStatus.NONE;
  };

  goToGroupDetails = (group: GroupItem, groupStatus: GroupStatus) => {
    this.props.navigation.navigate("GroupDetails", {
      group: group,
      groupStatus: groupStatus,
    });
  };

  generateListItem = (group: any) => (
    <MainListItem
      title={group.name}
      description={group.description}
      onPress={() => {
        this.goToGroupDetails(group, group.groupStatus);
      }}
      imgUri={require("../../assets/group-icon.jpg")}
      rightElement={
        <Icon name="arrow-forward" color={Colors.PrimaryDarkBlue} size={25} />
      }
    />
  );

  renderListEmpty = () => {
    return (
      <View style={styles.listEmptyContainer}>
        <Text style={{ color: Colors.PrimaryDarkBlue }}>
          You haven't joined any groups. You should try it!
        </Text>
      </View>
    );
  };

  onRefresh = async () => {
    this.setState({ refreshing: true });
    await this.getGroups();
    this.setState({ refreshing: false });
  };

  onPressSearchGroups = () => {
    this.props.navigation.navigate("SearchModal", {
      onItemSelect: this.searchToGroupDetails,
      searchQueryInit: this.props.searchQuery,
      setSearchQueryExternal: this.props.setSearchQuery,
      searchItems: searchPublicGroups,
      leftIconProps: { name: "group", type: "material" },
    });
  };

  render() {
    let data = [
      {
        title: "GROUPS",
        data: this.props.groups.groups.map((g, i) => {
          return i === this.props.groups.groups.length - 1
            ? {
                ...g,
                groupStatus: GroupStatus.MEMBER,
              }
            : {
                ...g,
                groupStatus: GroupStatus.MEMBER,
                containerStyle: {
                  borderBottomWidth: 1,
                  borderColor: Colors.LightGrey,
                },
              };
        }),
      },
      {
        title: "SUBSCRIPTIONS",
        data: this.props.groups.subscriptions.map((g, i) => {
          return i === this.props.groups.subscriptions.length - 1
            ? {
                ...g,
                groupStatus: GroupStatus.SUBSCRIBER,
              }
            : {
                ...g,
                groupStatus: GroupStatus.SUBSCRIBER,
                containerStyle: {
                  borderBottomWidth: 1,
                  borderColor: Colors.LightGrey,
                },
              };
        }),
      },
    ];

    _.remove(data, (item) => {
      return item.data.length === 0;
    });

    return (
      <View style={styles.container}>
        <LoaderOverlay visible={this.state.loading} />
        <View style={styles.searchContainer}>
          <TopListButton
            text="Search"
            iconType="material"
            iconName="search"
            style={{ flex: 1 }}
            onPress={this.onPressSearchGroups}
          />
        </View>
        {/* generic loading component used to show a loading
         * spinner and deactivate the page until loading
         * is finished
         */}
        {/* search bar button used to load the search modal
         * (in this case to search for public groups)
         */}
        {/* // section list used to neatly separate the two types of groups: membership and subscriptions */}
        <SectionList
          sections={data}
          // conditional render so that all but the last element in the list
          // has a bottom border (otherwise overlaps with second list)
          keyExtractor={(item, index) => item.gid + index}
          contentContainerStyle={{ flexGrow: 1 }}
          onRefresh={this.onRefresh}
          refreshing={this.state.refreshing}
          // onRefresh and refreshing all list to be reloaded independently
          // as a 'drag up to reload' operation
          renderItem={({ item }) => this.generateListItem(item)}
          ItemSeparatorComponent={() => <View style={styles.seperator} />}
          ListEmptyComponent={this.renderListEmpty}
          ListFooterComponent={() => <View style={styles.footerLine} />}
          renderSectionHeader={({ section: { title } }) => (
            <SectionHeader title={title} color={Colors.PrimaryLightBlue} />
          )}
        />
      </View>
    );
  }
}

const GroupsContainer = connect(
  (state) => ({
    groups: state.groups.groups,
    searchQuery: state.groups.searchQuery,
  }),
  { setGroups, setSearchQuery }
)(Groups);

export default GroupsContainer;

const seperator = {
  height: 1,
  alignSelf: "flex-end",
  width: Dimensions.width - 13,
  backgroundColor: "$lightGrey",
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "$white",
  },
  seperator: seperator,
  footerLine: {
    ...seperator,
    width: "100%",
  },
  listEmptyContainer: {
    flex: 1,
    width: Dimensions.width,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "$white",
  },
});
