import * as React from "react";
import { View, Modal, SafeAreaView, ScrollView, FlatList } from "react-native";
import { ListItem } from "react-native-elements";
import ModalHeader from "../../../components/Headers/ModalHeader";
import { CrossButton, BlueTextButton } from "../../../components/Buttons";
import EStyleSheet from "react-native-extended-stylesheet";
import { Category } from "../../../types/events";
import { CategoriesToStr } from "../../../modules";
import _ from "lodash";

interface SelectCategoriesProps {
  visible: boolean;
  selectedCategories: Category[];
  onCancel: () => void;
  onDone: (categories: CategorySelector[]) => void;
}

interface SelectCategoriesState {
  categories: CategorySelector[];
}

export interface CategorySelector {
  categoryId: Category;
  categoryName: string;
  isSelected: boolean;
}

export class SelectCategories extends React.Component<
  SelectCategoriesProps,
  SelectCategoriesState
> {
  constructor(props: SelectCategoriesProps) {
    super(props);
    this.state = {
      categories: [],
    };
  }

  componentDidMount() {
    this.generateList();
  }

  componentDidUpdate(prevProps: SelectCategoriesProps) {
    if (
      prevProps.visible !== this.props.visible &&
      this.props.visible === true
    ) {
      this.generateList();
    }
  }

  generateList = () => {
    let categoryStrings: Category[] = [];

    for (let category in Category) {
      categoryStrings.push(category);
    }

    const categories: CategorySelector[] = categoryStrings.map((val) => {
      const selector: CategorySelector = {
        categoryId: val,
        categoryName: CategoriesToStr([val])[0],
        isSelected: _.includes(this.props.selectedCategories, val),
      };
      return selector;
    });

    this.setState({ categories });
  };

  onPressCategory = (category: CategorySelector) => {
    let categories: CategorySelector[] = [...this.state.categories];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].categoryId === category.categoryId) {
        categories[i].isSelected = !categories[i].isSelected;
        break;
      }
    }

    this.setState({ categories });
  };

  render() {
    return (
      <Modal visible={this.props.visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <FlatList
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <ModalHeader
                  title="Select Categories"
                  leftButton={
                    <CrossButton
                      style={{ position: "absolute", left: 0 }}
                      onPress={this.props.onCancel}
                    />
                  }
                  rightButton={
                    <BlueTextButton
                      containerStyle={{ position: "absolute", right: 0 }}
                      text="Done"
                      textSize={18}
                      onPress={() => this.props.onDone(this.state.categories)}
                      active
                    />
                  }
                />
              </View>
            }
            data={this.state.categories}
            renderItem={({ item }) => (
              <ListItem
                title={item.categoryName}
                bottomDivider
                style={styles.listItem}
                onPress={() => this.onPressCategory(item)}
                checkmark={item.isSelected}
              />
            )}
            keyExtractor={(item) => item.categoryId.toString()}
          />
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    // width: "90%",
    // alignSelf: "center",
  },
  listItem: {
    width: "90%",
    alignSelf: "center",
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
  headerContainer: {
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
});
