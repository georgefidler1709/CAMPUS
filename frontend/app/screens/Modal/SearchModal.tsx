import React, { Component } from "react";
import { View, Text, ScrollView, YellowBox } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Icon, Button, IconProps } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { TextInput } from "react-native-gesture-handler";
import { Colors } from "../../constants";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { ListItem } from "react-native-elements";
import { Location, FocusLocation } from "../../types/location";
import { connect } from "react-redux";
import { searchLocations } from "../../api";
import { RouteProp } from "@react-navigation/native";

// Warning is only relevant if we intend to use
// state persistence and/or deep link
// using react navigation
YellowBox.ignoreWarnings([
  "Non-serializable values were found in the navigation state",
]);

interface SearchModalState {
  items: any[];
  searchQuery: string;
}

interface SearchModalProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, SearchModalRouteProps>, string>;
}

interface SearchModalRouteProps {
  // value to initialise the search query to
  searchQueryInit: string;
  // if the search query is to be displayed elsewhere (using redux)
  // then this value will also be changed when the user changes 
  // the search query
  setSearchQueryExternal: (s: string) => void;
  // search function, call to the backend to search the db
  searchItems: (newQuery: string) => Promise<any[]>;
  // function called when a search item is selected, 
  // usually involves navigation away from this screen
  onItemSelect: (
    item: any,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => void;
  onGoBack?: () => void;
  leftIconProps: object;
}

// Generic modal used for handling search operations
export default class SearchModal extends Component<
  SearchModalProps,
  SearchModalState
> {
  constructor(props: SearchModalProps) {
    super(props);

    this.state = {
      items: [],
      searchQuery: props.route.params.searchQueryInit,
    };
  }

  componentDidMount() {
    this.updateSearch(this.state.searchQuery);
  }

  setItems = (items: any[]) => {
    this.setState({ items });
  };

  setSearchQuery = (searchQuery: string) => {
    this.props.route.params.setSearchQueryExternal(searchQuery);
    this.setState({ searchQuery });
  };

  updateSearch(newQuery: string) {
    this.props.route.params.searchItems(newQuery).then(this.setItems);
  }

  render() {
    const { leftIconProps, onItemSelect } = this.props.route.params;
    return (
      <View style={styles.container}>
        <View style={styles.blankSpace} />
        <View style={styles.searchBar}>
          <Button
            onPress={() => {
              if (this.props.route.params.onGoBack) {
                this.props.route.params.onGoBack();
              }
              this.props.navigation.goBack();
            }}
            type="clear"
            icon={<Icon type="material" name="arrow-back" size={20} />}
          />
          {/* text input where the user can update their search query */}
          <TextInput
            style={styles.searchBarInput}
            value={this.state.searchQuery}
            onChangeText={(s) => {
              this.setSearchQuery(s);
              this.updateSearch(s);
            }}
            autoFocus={true}
          />
        </View>
        {/* scrollable view where the items returned from the search function
          * are displayed as selectable list items
          */
        }
        <ScrollView>
          {this.state.items &&
            this.state.items.map((item, i) => (
              <ListItem
                style={styles.item}
                key={i}
                title={item.name}
                leftIcon={{
                  ...leftIconProps,
                  iconStyle: styles.icon,
                  containerStyle: styles.iconContainer,
                }}
                rightIcon={{ name: "call-made", type: "material" }}
                onPress={() => {
                  this.setSearchQuery(item.name);
                  onItemSelect(item, this.props.navigation);
                }}
                bottomDivider={true}
              />
            ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    width: Dimensions.width * 0.9,
    borderColor: "lightgrey",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    marginBottom: Dimensions.height * 0.02,
  },
  searchBarInput: {
    flex: 1,
  },
  item: {
    width: Dimensions.width,
  },
  icon: {
    backgroundColor: "#ebebeb",
    borderRadius: 20,
    padding: 5,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: "white",
  },
  blankSpace: {
    width: Dimensions.width,
    height: Dimensions.height * 0.05,
  },
});
