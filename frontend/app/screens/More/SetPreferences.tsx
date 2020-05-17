import React, { Component } from "react";
import { View, SafeAreaView, Alert, ScrollView, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { ListItem } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { Category } from "../../types/events";
import { getUserPreferences, updateUser } from "../../api";
import { SelectCategories, CategorySelector } from "../Events/components";
import { CategoriesToStr } from "../../modules";
import {
  DetailsButton,
  CrossButton,
  BlueTextButton,
} from "../../components/Buttons";
import ModalHeader from "../../components/Headers/ModalHeader";
import { Colors } from "../../constants";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { LoaderOverlay } from "../../components/Modal";

interface SetPreferencesProps {
  navigation: ProfileScreenNavigationProp;
}

interface SetPreferencesState {
  showFirst: Category[];
  showNever: Category[];
  categorySelectorVisible: boolean;
  categorySelectorShowing: CategorySelectorShowing;
  loading: boolean;
}

enum CategorySelectorShowing {
  SHOW_FIRST,
  SHOW_NEVER,
  NONE,
}

// Screen used by the user to select the categories of events
// they enjoy and that they don't enjoy
// to allow for better personalised event recommendations.
// UI is designed to mirror the IOS settings menu
class SetPreferences extends Component<
  SetPreferencesProps,
  SetPreferencesState
> {
  constructor(props: SetPreferencesProps) {
    super(props);
    this.state = {
      showFirst: [],
      showNever: [],
      categorySelectorVisible: false,
      categorySelectorShowing: CategorySelectorShowing.NONE,
      loading: true,
    };
  }

  // load in the user's current preferences for updating
  componentDidMount = async () => {
    const res: any = await getUserPreferences();
    this.setPreferences(res);
    this.setLoading(false);
  };

  setPreferences = (preferences: any) => {
    const { showFirst, showNever } = preferences;
    this.setShowFirst(showFirst);
    this.setshowNever(showNever);
  };

  setShowFirst = (showFirst: Category[]) => {
    this.setState({ showFirst });
  };

  setshowNever = (showNever: Category[]) => {
    this.setState({ showNever });
  };

  setLoading = (loading: boolean) => {
    this.setState({ loading });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  // update the user's likes and dislikes only when
  // the current changes are saved
  onSave = () => {
    updateUser({
      show_first: this.state.showFirst,
      show_never: this.state.showNever,
    });

    this.goBack();
  };

  openScreen = (screenName: string) =>
    this.props.navigation.navigate(screenName);

  onSelectedCategories = (categories: CategorySelector[]) => {
    let selectedCategories: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].isSelected) {
        selectedCategories.push(categories[i].categoryId);
      }
    }

    if (
      this.state.categorySelectorShowing === CategorySelectorShowing.SHOW_FIRST
    ) {
      this.setState({
        showFirst: selectedCategories,
        categorySelectorVisible: false,
        categorySelectorShowing: CategorySelectorShowing.NONE,
      });
    } else {
      this.setState({
        showNever: selectedCategories,
        categorySelectorVisible: false,
        categorySelectorShowing: CategorySelectorShowing.NONE,
      });
    }
  };

  // Generate a styled list of the user's current preferences.
  // This list is entirely clickable and will open a modal to allow
  // the user's preferences to be changed onclick.
  generatePrefsSection = (
    title: string,
    prefsList: string[],
    onPress: () => void,
    description: string
  ) => {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <Text style={{ marginBottom: 5 }}>{title}</Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: "#FFF",
            overflow: "hidden",
            marginBottom: 5,
          }}
        >
          {prefsList.map((item, i) =>
            i !== prefsList.length - 1 ? (
              <ListItem
                key={i}
                title={item}
                style={{
                  borderBottomColor: Colors.LightGrey,
                  borderBottomWidth: 1,
                }}
                containerStyle={{ padding: 10 }}
              />
            ) : (
              <ListItem key={i} title={item} containerStyle={{ padding: 10 }} />
            )
          )}
        </View>
        <Text style={styles.description}>{description}</Text>
      </TouchableWithoutFeedback>
    );
  };

  showFirstSelector = () =>
    this.setState({
      categorySelectorVisible: true,
      categorySelectorShowing: CategorySelectorShowing.SHOW_FIRST,
    });

  showNeverSelector = () =>
    this.setState({
      categorySelectorVisible: true,
      categorySelectorShowing: CategorySelectorShowing.SHOW_NEVER,
    });

  render() {
    return (
      <View>
        <LoaderOverlay visible={this.state.loading} />
        <SafeAreaView>
          {!this.state.loading && (
            <>
              <View
                style={{
                  width: "90%",
                  alignSelf: "center",
                }}
              >
                <ModalHeader
                  title={"Set Preferences"}
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
                      active={true}
                    />
                  }
                />
              </View>
              <SelectCategories
                visible={this.state.categorySelectorVisible}
                onCancel={() =>
                  this.setState({ categorySelectorVisible: false })
                }
                onDone={this.onSelectedCategories}
                selectedCategories={
                  this.state.categorySelectorShowing ===
                  CategorySelectorShowing.SHOW_FIRST
                    ? this.state.showFirst
                    : this.state.showNever
                }
              />

              <ScrollView
                style={{
                  marginVertical: 10,
                  width: Dimensions.width * 0.9,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {this.generatePrefsSection(
                  "PREFERENCES",
                  CategoriesToStr(this.state.showFirst),
                  this.showFirstSelector,
                  `Events sharing your preferences will be recommended to you.`
                )}

                <View style={styles.blankSpace} />

                {this.generatePrefsSection(
                  "DISLIKES",
                  CategoriesToStr(this.state.showNever),
                  this.showNeverSelector,
                  `Events sharing your dislikes will show up less often.`
                )}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </View>
    );
  }
}

export default SetPreferences;

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
    height: Dimensions.height * 0.04,
  },
  description: {
    color: "#8f8f8f",
    fontSize: 13,
  },
});
