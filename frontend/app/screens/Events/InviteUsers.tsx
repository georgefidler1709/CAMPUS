import * as React from "react";
import { View, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { User } from "../../types/user";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { ListItem } from "react-native-elements";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import EStyleSheet from "react-native-extended-stylesheet";
import ModalHeader from "../../components/Headers/ModalHeader";
import {
  CrossButton,
  BlueTextButton,
  BorderButton,
} from "../../components/Buttons";
import { Colors } from "../../constants";
import { searchUsers, inviteToEvent } from "../../api";
import _ from "lodash";
import { LoadingOverlay } from "../../components/Modals";

interface InviteUsersProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, InviteUsersRouteProps>, string>;
}

interface InviteUsersState {
  users: User[];
  loading: boolean;
}

interface InviteUsersRouteProps {
  eid: string;
}

class InviteUsers extends React.Component<InviteUsersProps, InviteUsersState> {
  constructor(props: InviteUsersProps) {
    super(props);

    this.state = {
      users: [],
      loading: false,
    };
  }

  /**
   * Navigate to a search modal to search for users, and
   * pass this.addPerson for when a user is tapped
   */
  onPressAddPerson = () => {
    this.props.navigation.navigate("SearchModal", {
      onItemSelect: this.addPerson,
      searchQueryInit: "",
      setSearchQueryExternal: () => {},
      searchItems: searchUsers,
      leftIconProps: { name: "person", type: "material" },
    });
  };

  /**
   * When a person is tapped in the search modal, add them to the
   * local state to display them in the invited list
   */
  addPerson = (
    user: User,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    this.setState({
      users: [...this.state.users, user],
    });
    searchModalNavigation.goBack();
  };

  /**
   * Remove the person with the passed in uid from state
   */
  removePerson = (uid: string) => {
    const users = _.filter(this.state.users, (user) => {
      return user.uid !== uid;
    });
    this.setState({ users });
  };

  renderAddButton = () => (
    <View style={styles.buttonContainer}>
      <BorderButton
        title="Add Person"
        color={Colors.White}
        buttonStyle={styles.buttonStyle}
        iconProps={{
          name: "person-add",
        }}
        onPress={this.onPressAddPerson}
      />
    </View>
  );

  /**
   * When the invite button is pressed, create an array of promises
   * calling the inviteToEvent API function, which will invite all users
   * in the state. When this resolves, go back to the event details page
   */
  inviteUsers = () => {
    this.setState({ loading: true });
    let promises = [];
    for (let i = 0; i < this.state.users.length; i++) {
      promises.push(
        inviteToEvent(this.props.route.params.eid, this.state.users[i].uid)
      );
    }
    Promise.all(promises).then((res) => {
      this.setState({ loading: false });
      this.props.navigation.goBack();
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ width: "90%", alignSelf: "center" }}>
          <ModalHeader
            title="Invite People"
            leftButton={
              <CrossButton
                style={{ position: "absolute", left: 0 }}
                onPress={() => this.props.navigation.goBack()}
              />
            }
            rightButton={
              // Only activate button when there are users in the invite list state
              <BlueTextButton
                active={this.state.users.length > 0}
                text="Invite"
                textSize={18}
                containerStyle={{ position: "absolute", right: 0 }}
                onPress={this.inviteUsers}
              />
            }
          />
        </View>

        <FlatList
          data={this.state.users}
          contentContainerStyle={{
            flexGrow: 1,
            width: "90%",
            alignSelf: "center",
          }}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              bottomDivider
              leftIcon={{ name: "person" }}
              rightElement={
                <CrossButton
                  size={25}
                  style={styles.deleteUserButton}
                  onPress={() => this.removePerson(item.uid)}
                />
              }
            />
          )}
          ListFooterComponent={this.renderAddButton}
          ListHeaderComponent={() => <View style={styles.topDivider} />}
          keyExtractor={(item) => item.uid}
        />
        <LoadingOverlay visible={this.state.loading} />
      </SafeAreaView>
    );
  }
}

export default InviteUsers;

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  buttonStyle: {
    backgroundColor: Colors.PrimaryLightBlue,
    borderRadius: 5,
    width: "100%",
  },
  topDivider: {
    width: "100%",
    backgroundColor: Colors.LightGrey,
    height: 1,
    marginTop: 30,
  },
  deleteUserButton: {},
});
