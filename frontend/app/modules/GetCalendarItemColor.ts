import { Category } from "../types/events";
import { Colors } from "../constants";
import _ from "lodash";

export default (categories: Category[]): string => {
  if (
    _.includes(categories, Category.LECTURE) ||
    _.includes(categories, Category.MEETING) ||
    _.includes(categories, Category.REHEARSAL) ||
    _.includes(categories, Category.SEMINAR) ||
    _.includes(categories, Category.TUTORIAL)
  ) {
    return Colors.Purple;
  }
  return Colors.Red;
};
