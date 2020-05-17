import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  YellowBox,
  SafeAreaView,
  FlatList,
} from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Icon, Button, IconProps } from "react-native-elements";
import Dimensions from "../../styles/Dimensions";
import { TextInput } from "react-native-gesture-handler";
import { ProfileScreenNavigationProp } from "../../types/navigation";
import { ListItem } from "react-native-elements";
import { RouteProp } from "@react-navigation/native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import {
  MainListItem,
  FakeSearchBarButton,
  CrossButton,
} from "../../components/Buttons";
import GenericHeader from "../../components/Headers/GenericHeader";
import { GroupStatus } from "../../types/groups";
import HeaderButton from "../../components/Buttons/HeaderButton";
import { LoaderOverlay } from "../../components/Modal";
import ModalHeader from "../../components/Headers/ModalHeader";

// Warning is only relevant if we intend to use
// state persistence and/or deep link
// using react navigation
YellowBox.ignoreWarnings([
  "Non-serializable values were found in the navigation state",
]);

interface ListModalState {
  items: any[];
  loading: boolean;
}

interface ListModalProps {
  navigation: ProfileScreenNavigationProp;
  route: RouteProp<Record<string, ListModalRouteProps>, string>;
}

interface ListModalRouteProps {
  items: any[];
  keyExtractor: (item: any, index: number) => string;
  onPress: (item: any, listNav: ProfileScreenNavigationProp) => void;
  imgUri: string;
  title: string;
  loadItems?: () => Promise<any[]>;
}

export default class ListModal extends Component<
  ListModalProps,
  ListModalState
> {
  constructor(props: ListModalProps) {
    super(props);

    this.state = {
      items: this.props.route.params.items,
      loading: false,
    };
  }

  componentDidMount() {
    this.updateItems();
  }

  updateItems = async () => {
    const { loadItems } = this.props.route.params;
    if (loadItems) {
      this.setLoading(true);
      const items = await loadItems();
      this.setItems(items);
      this.setLoading(false);
    }
  };

  setItems = (items: any[]) => {
    this.setState({ items });
  };

  setLoading = (loading: boolean) => {
    this.setState({ loading });
  };

  generateListItem = (item: any) => {
    const { onPress, imgUri } = this.props.route.params;
    return (
      <MainListItem
        title={item.name}
        description={item.description}
        containerStyle={item.containerStyle}
        onPress={() => {
          onPress(item, this.props.navigation);
        }}
        imgUri={imgUri}
        rightElement={
          <Icon name="arrow-forward" color={Colors.PrimaryDarkBlue} size={25} />
        }
      />
    );
  };

  render() {
    const { keyExtractor, title } = this.props.route.params;
    const { items, loading } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ width: "90%" }}>
          <ModalHeader
            title={title}
            leftButton={
              <CrossButton
                style={{ position: "absolute", left: 0 }}
                onPress={() => this.props.navigation.goBack()}
              />
            }
            rightButton={null}
          />
        </View>
        <LoaderOverlay visible={loading} />
        <View
          style={{ height: Dimensions.width * 0.05, width: Dimensions.width }}
        />
        {!loading && (
          <FlatList
            data={items.map((item, i) => {
              return i === items.length - 1
                ? item
                : {
                    ...item,
                    containerStyle: {
                      borderBottomWidth: 1,
                      borderColor: Colors.LightGrey,
                    },
                  };
            })}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => this.generateListItem(item)}
            keyExtractor={(item, index) => keyExtractor(item, index)}
            ListEmptyComponent={() => (
              <View style={styles.emptyComponent}>
                <Text>No Event Invites</Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
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
  emptyComponent: {
    flex: 1,
    width: Dimensions.width,
    alignItems: "center",
    justifyContent: "center",
  },
});
