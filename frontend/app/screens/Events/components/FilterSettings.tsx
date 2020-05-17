import * as React from "react";
import { View, Modal, SafeAreaView, ScrollView, FlatList } from "react-native";
import ModalHeader from "../../../components/Headers/ModalHeader";
import {
  CrossButton,
  BlueTextButton,
  Switcher,
  DetailsButton,
} from "../../../components/Buttons";
import { Button } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { Category, EventFilter, Event } from "../../../types/events";
import _ from "lodash";
import { LoadingOverlay } from "../../../components/Modals";
import { collectPublicEvents, searchLocations } from "../../../api";
import { Location } from "../../../types/location";
import { ProfileScreenNavigationProp } from "../../../types/navigation";
import { CategoriesToStr } from "../../../modules";
import { SelectCategories, CategorySelector } from "./SelectCategories";

interface FilterSettingsProps {
  navigation: ProfileScreenNavigationProp;
  visible: boolean;
  onCancel: () => void;
  onDone: (filter: EventFilter, locationName: string) => void;
  setEvents: (events: Event[]) => void;
  currentFilter: EventFilter;
  currentLocationName: string;
}

interface FilterSettingsState {
  filter: EventFilter;
  locationFilter: Location;
  loading: boolean;
  visible: boolean;
  categorySelectorVisible: boolean;
}

class FilterSettings extends React.Component<
  FilterSettingsProps,
  FilterSettingsState
> {
  constructor(props: FilterSettingsProps) {
    super(props);
    this.state = {
      filter: { ...props.currentFilter },
      locationFilter: {
        id: "",
        name: props.currentLocationName,
        latlong: {
          latitude: 0,
          longitude: 0,
        },
      },
      loading: false,
      visible: props.visible,
      categorySelectorVisible: false,
    };
  }

  componentDidUpdate(prevProps: FilterSettingsProps) {
    if (prevProps.visible !== this.props.visible) {
      this.setState({ visible: this.props.visible });
    }
    if (!_.isEqual(prevProps.currentFilter, this.props.currentFilter)) {
      this.setState({
        filter: { ...this.props.currentFilter },
        locationFilter: {
          ...this.state.locationFilter,
          name: this.props.currentLocationName,
        },
      });
    }
  }

  setValue = (key: string, val: any) => {
    this.setState({ filter: { ...this.state.filter, [key]: val } });
  };

  setFilters = async () => {
    this.setState({ loading: true });
    this.props.onDone(this.state.filter, this.state.locationFilter.name);
    const events = await collectPublicEvents(this.state.filter);
    this.props.setEvents(events);
    this.props.onCancel();
    this.setState({ loading: false });
  };

  onSelectedCategories = (categories: CategorySelector[]) => {
    let selectedCategories: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].isSelected) {
        selectedCategories.push(categories[i].categoryId);
      }
    }

    this.setState({
      filter: { ...this.state.filter, categories: selectedCategories },
      categorySelectorVisible: false,
    });
  };

  onPressSelectLocation = () => {
    this.setState({ visible: false });
    this.props.navigation.navigate("SearchModal", {
      onItemSelect: this.onSelectLocation,
      searchQueryInit: "",
      setSearchQueryExternal: () => {},
      searchItems: searchLocations,
      onGoBack: () => this.setState({ visible: true }),
      leftIconProps: { name: "place", type: "material" },
    });
  };

  onSelectLocation = (
    l: Location,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    this.setState({
      locationFilter: l,
      filter: {
        ...this.state.filter,
        location: l.id,
      },
      visible: true,
    });
    searchModalNavigation.goBack();
  };

  onPressReset = () => {
    this.setState({
      filter: {
        happening_now: false,
        location: null,
        categories: [],
      },
      locationFilter: {
        id: "",
        name: "",
        latlong: {
          latitude: 0,
          longitude: 0,
        },
      },
    });
  };

  onCancel = () => {
    this.setState({
      filter: { ...this.props.currentFilter },
      locationFilter: {
        ...this.state.locationFilter,
        name: this.props.currentLocationName,
      },
    });
    this.props.onCancel();
  };

  render() {
    return (
      <Modal visible={this.state.visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <SelectCategories
            visible={this.state.categorySelectorVisible}
            selectedCategories={this.state.filter.categories}
            onCancel={() => this.setState({ categorySelectorVisible: false })}
            onDone={this.onSelectedCategories}
          />
          <View style={styles.headerContainer}>
            <ModalHeader
              title="Event Filters"
              leftButton={
                <CrossButton
                  style={{ position: "absolute", left: 0 }}
                  onPress={this.onCancel}
                />
              }
              rightButton={
                <BlueTextButton
                  containerStyle={{ position: "absolute", right: 0 }}
                  text="Done"
                  textSize={18}
                  onPress={this.setFilters}
                  active
                />
              }
            />
          </View>
          <View style={styles.subContainer}>
            <DetailsButton
              iconType="material"
              iconName="location-on"
              placeholderText="Add filter by location"
              value={this.state.locationFilter.name}
              onPress={this.onPressSelectLocation}
            />
            <View style={styles.divider} />
            <DetailsButton
              placeholderText="Add filter by categories"
              value={CategoriesToStr(this.state.filter.categories)}
              iconType="material-community"
              iconName="buffer"
              onPress={() => this.setState({ categorySelectorVisible: true })}
            />
            <View style={styles.divider} />
            <Switcher
              label="Happening Now"
              value={this.state.filter.happening_now}
              onToggleSwitch={() =>
                this.setValue("happening_now", !this.state.filter.happening_now)
              }
            />
            <Button
              type="outline"
              title="Reset Filters"
              containerStyle={styles.resetButtonContainer}
              buttonStyle={styles.resetButton}
              titleStyle={styles.resetButtonText}
              onPress={this.onPressReset}
            />
          </View>
          <LoadingOverlay visible={this.state.loading} />
        </SafeAreaView>
      </Modal>
    );
  }
}

export default FilterSettings;

const styles = EStyleSheet.create({
  container: {
    alignItems: "center",
  },
  subContainer: {
    alignItems: "center",
    width: "90%",
  },
  headerContainer: {
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  divider: {
    backgroundColor: "$lightGrey",
    height: 1,
    width: "95%",
  },
  resetButtonContainer: {
    width: "95%",
    marginTop: 25,
  },
  resetButton: {
    borderColor: "$primaryLightBlue",
  },
  resetButtonText: {
    color: "$primaryLightBlue",
  },
});
