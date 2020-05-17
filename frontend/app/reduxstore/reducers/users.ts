import { SET_SEARCH_QUERY } from "../actions/users";

const initialState = {
    searchQuery: "",
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SEARCH_QUERY:
            return {
                ...state,
                searchQuery: action.searchQuery
            }; 
            default:
        return state;
    }
};

export default reducer;