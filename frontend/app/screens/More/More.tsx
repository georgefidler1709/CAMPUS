import React, { Component } from "react";
import { View, Alert, ScrollView } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { ListItem } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import * as firebase from "firebase/app";
import { deleteUser, collectInvites } from "../../api";
import { Colors } from "../../constants";
import { connect } from "react-redux";

interface MoreProps {
  navigation: ProfileScreenNavigationProp;
  numInvites: number;
}

// More page offers varied small-scale functionality
// not worth of their own tab on the bottom bar
// namely:
// - logging out
// - deleting an account
// - viewing all event invites in one place
// - updating account preferences to receive better personalised event recommendations
class More extends Component<MoreProps> {
  constructor(props: MoreProps) {
    super(props);
    this.state = {};
  }

  openScreen = (screenName: string) =>
    this.props.navigation.navigate(screenName);

  // log out using firebase
  // (warning provided to stop this being done accidentally)
  logOut = () => {
    // code to log out
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: () => {
          firebase
            .auth()
            .signOut()
            .then(() => {})
            .catch((error) => {
              // An error happened.
            });
        },
      },
    ]);
  };

  // delete account using firebase
  // (warning provided to stop this being done accidentally)
  deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete your account?

Your data will be deleted and you will not be able to retrieve it later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            const user = firebase.auth().currentUser;
            await deleteUser();
            user!
              .delete()
              .then(() => {})
              .catch((error) => {
                // An error happened.
                Alert.alert(
                  "Account Deletion Failed",
                  "Please refresh your login and try again.",
                  [{ text: "OK" }]
                );
              });
          },
        },
      ]
    );
  };

  // use the list modal to display a full list of events the
  // current user has been invited to but has yet to respond to the invite
  showInvites = () => {
    this.props.navigation.navigate("ListModal", {
      items: [],
      keyExtractor: (item: any, index: number) => item.eid + index,
      imgUri: require("../../assets/event-icon.png"),
      onPress: (event: any, listNav: ProfileScreenNavigationProp) => {
        listNav.navigate("EventDetails", { event: event });
      },
      loadItems: collectInvites,
      title: "Invites",
    });
  };

  render() {
    // red badge on the invites item shows how many new invites
    // the current user has received
    const numInvitesBadge =
      this.props.numInvites > 0
        ? { value: this.props.numInvites, status: "error" }
        : undefined;
    const list = [
      {
        title: "Preferences",
        typeName: "material-community",
        iconName: "tune",
        badge: undefined,
        color: Colors.PrimaryDarkBlue,
        onPress: () => this.openScreen("SetPreferences"),
      },
      {
        title: "Invites",
        typeName: "material",
        iconName: "mail",
        badge: numInvitesBadge,
        color: Colors.PrimaryDarkBlue,
        onPress: () => this.showInvites(),
      },
      {
        title: "Log Out",
        typeName: "font-awesome",
        iconName: "sign-out",
        badge: undefined,
        color: Colors.Red,
        onPress: this.logOut,
      },
      {
        title: "Delete Account",
        typeName: "font-awesome",
        iconName: "user-times",
        badge: undefined,
        color: Colors.Red,
        onPress: this.deleteAccount,
      },
    ];

    return (
      <ScrollView>
        <View style={styles.blankSpace} />
        {list.map((item, i) => (
          <ListItem
            style={styles.item}
            key={i}
            title={item.title}
            titleStyle={{ color: item.color }}
            badge={item.badge}
            leftIcon={{
              name: item.iconName,
              type: item.typeName,
              color: item.color,
            }}
            bottomDivider
            chevron
            onPress={item.onPress}
          />
        ))}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const { numInvites } = state.events;
  return {
    numInvites,
  };
};

export default connect(mapStateToProps)(More);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: Dimensions.width,
  },
  blankSpace: {
    width: Dimensions.width,
    height: Dimensions.height * 0.05,
  },
});
