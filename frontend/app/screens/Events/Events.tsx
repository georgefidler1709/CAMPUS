import React, { Component } from "react";
import { View, SectionList, Text } from "react-native";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import EStyleSheet from "react-native-extended-stylesheet";
import { MainListItem, TopListButton } from "../../components/Buttons";
import { Icon } from "react-native-elements";
import { Colors } from "../../constants";
import { EventFilter, Event, EventSearchItem } from "../../types/events";
import { collectPublicEvents, searchPublicEvents, getEvent } from "../../api";
import _ from "lodash";
import Moment from "moment";
import { extendMoment } from "moment-range";
import Dimensions from "../../styles/Dimensions";
import { SectionHeader } from "../../components/Titles";
import { connect } from "react-redux";
import {
  setPublicEvents,
  setPublicEventsFilter,
} from "../../reduxstore/actions/events";
import { FilterSettings } from "./components";

const moment = extendMoment(Moment);

interface EventsProps {
  navigation: ProfileScreenNavigationProp;
  setPublicEvents: (events: Event[]) => void;
  setPublicEventsFilter: (filter: EventFilter, locationName: string) => void;
  publicEvents: Event[];
  publicEventsFilter: EventFilter;
  publicEventsFilterLocationName: string;
}

interface EventsState {
  events: EventSections[];
  refreshing: boolean;
  filterSettingsVisible: boolean;
}

interface EventSections {
  title: string;
  color: string;
  data: Event[];
}

class Events extends Component<EventsProps, EventsState> {
  constructor(props: EventsProps) {
    super(props);
    this.state = {
      events: [],
      refreshing: false,
      filterSettingsVisible: false,
    };
  }

  componentDidMount() {
    this.renderEvents();
  }

  componentDidUpdate(prevProps: EventsProps) {
    if (!_.isEqual(prevProps.publicEvents, this.props.publicEvents)) {
      this.renderEvents();
    }
  }

  onRefresh = async () => {
    this.setState({ refreshing: true });
    let events = await collectPublicEvents(this.props.publicEventsFilter);
    this.props.setPublicEvents(events);
    this.setState({ refreshing: false });
  };

  /**
   * Organise events from redux into sections based on their time
   * and preferences
   */
  renderEvents = async () => {
    const events = [...this.props.publicEvents];
    let sectionedEvents: EventSections[] = [
      {
        title: "RECOMMENDED",
        color: Colors.Green,
        data: [],
      },
      {
        title: "HAPPENING NOW",
        color: Colors.PrimaryLightBlue,
        data: [],
      },
      {
        title: "HAPPENING LATER",
        color: Colors.PrimaryLightBlue,
        data: [],
      },
      {
        title: "NEXT FEW DAYS",
        color: Colors.PrimaryLightBlue,
        data: [],
      },
      {
        title: "NEXT FEW WEEKS",
        color: Colors.PrimaryLightBlue,
        data: [],
      },
    ];

    let index = 0;
    // Seperate events into different sections based on time
    while (events.length !== 0) {
      const event = events.splice(0, 1)[0];
      const startTime = moment(event.start_time);
      const endTime = moment(event.end_time);
      const eventRange = moment.range(startTime, endTime);
      const now = moment();
      const nextDay = moment()
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .add(1, "day");
      const nextWeek = nextDay.clone().add(1, "week");

      // Public events is in preference order, so chuck the first 3 events of the array
      // into the recommended section, if there's more than 6 total events
      // Else If event is currently happening, put in the happening now section
      // Else if event is on same day, put in the happening later section
      // Else if event is within the next week but not today, put in next few days section
      // The rest of the events will be after this point, so put in next few weeks section
      if (this.props.publicEvents.length > 6 && index < 3) {
        sectionedEvents[0].data.push(event);
      } else if (now.within(eventRange)) {
        sectionedEvents[1].data.push(event);
      } else if (now.isSame(startTime, "day")) {
        sectionedEvents[2].data.push(event);
      } else if (
        startTime.isSameOrAfter(nextDay) &&
        startTime.isBefore(nextWeek)
      ) {
        sectionedEvents[3].data.push(event);
      } else {
        sectionedEvents[4].data.push(event);
      }
      index++;
    }

    // Don't show any sections that are empty
    _.remove(sectionedEvents, (section) => {
      return section.data.length === 0;
    });

    this.setState({ events: sectionedEvents });
  };

  goToEventDetails = (event: Event) => {
    this.props.navigation.navigate("EventDetails", {
      event,
      onDeleteNavigateTo: "Events",
    });
  };

  renderListEmpty = () => {
    return (
      <View style={styles.listEmptyContainer}>
        <Text style={{ color: Colors.PrimaryDarkBlue }}>No events!</Text>
      </View>
    );
  };

  setFilterModalVisible = (visible: boolean) => {
    this.setState({ filterSettingsVisible: visible });
  };

  onPressSearchEvents = () => {
    this.props.navigation.navigate("SearchModal", {
      onItemSelect: this.onSelectEvent,
      searchQueryInit: "",
      setSearchQueryExternal: () => {},
      searchItems: searchPublicEvents,
      leftIconProps: { name: "people", type: "material" },
    });
  };

  onSelectEvent = async (
    eventItem: EventSearchItem,
    searchModalNavigation: ProfileScreenNavigationProp
  ) => {
    const event = await getEvent(eventItem.eid);

    searchModalNavigation.navigate("EventDetails", {
      event,
      onDeleteNavigateTo: "Events",
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TopListButton
            text="Search"
            iconType="material"
            iconName="search"
            style={{ flex: 3 }}
            onPress={this.onPressSearchEvents}
          />
          <TopListButton
            text="Filter"
            iconType="material"
            iconName="tune"
            style={{ flex: 2, marginLeft: 0 }}
            onPress={() => this.setFilterModalVisible(true)}
          />
        </View>
        <SectionList
          sections={this.state.events}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => (
            <MainListItem
              title={item.name}
              description={item.description}
              imgUri={require("../../assets/event-icon.png")}
              onPress={() => this.goToEventDetails(item)}
              times={{ startTime: item.start_time, endTime: item.end_time }}
              rightElement={
                <Icon
                  name="arrow-forward"
                  color={Colors.PrimaryDarkBlue}
                  size={25}
                />
              }
            />
          )}
          renderSectionHeader={({ section: { title, color } }) => (
            <SectionHeader title={title} color={color} />
          )}
          onRefresh={this.onRefresh}
          refreshing={this.state.refreshing}
          ItemSeparatorComponent={() => <View style={styles.seperator} />}
          ListFooterComponent={() => <View style={styles.footerLine} />}
          ListEmptyComponent={this.renderListEmpty}
          keyExtractor={(item) => item.eid}
        />
        <FilterSettings
          navigation={this.props.navigation}
          visible={this.state.filterSettingsVisible}
          onCancel={() => this.setFilterModalVisible(false)}
          onDone={this.props.setPublicEventsFilter}
          setEvents={this.props.setPublicEvents}
          currentFilter={this.props.publicEventsFilter}
          currentLocationName={this.props.publicEventsFilterLocationName}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    publicEvents,
    publicEventsFilter,
    publicEventsFilterLocationName,
  } = state.events;
  return {
    publicEvents,
    publicEventsFilter,
    publicEventsFilterLocationName,
  };
};

const mapDispatchToProps = {
  setPublicEvents,
  setPublicEventsFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);

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
  listEmptyContainer: {
    flex: 1,
    width: Dimensions.width,
    alignItems: "center",
    justifyContent: "center",
  },
  seperator: seperator,
  footerLine: {
    ...seperator,
    width: "100%",
  },
  searchContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    backgroundColor: "$white",
  },
});
