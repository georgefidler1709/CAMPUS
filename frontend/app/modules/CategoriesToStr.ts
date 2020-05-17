import { Category } from "../types/events";

export default (categories: Category[]): string[] => {
  let categoryStrings: string[] = [];
  categories.forEach((category) => {
    let strSplit: string[] = category.split("_");

    for (let i = 0; i < strSplit.length; i++) {
      strSplit[i] = strSplit[i].toLowerCase();
      strSplit[i] = strSplit[i].replace(/^./g, strSplit[i][0].toUpperCase());
    }

    categoryStrings.push(strSplit.join(" "));
  });

  return categoryStrings;
};
