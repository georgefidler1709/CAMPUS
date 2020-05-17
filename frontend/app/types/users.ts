import { Category } from "./events";

export interface UpdateUser {
    name?: string;
    show_first?: Category[];
    show_never?: Category[];
}
  