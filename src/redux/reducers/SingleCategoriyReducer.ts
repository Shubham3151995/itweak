import {
    CLEAR_CATEGORY,
    ADD_CATEGORY
} from '../types';


const INITIAL_STATE = {
    CategoryData: false,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CLEAR_CATEGORY:
            return INITIAL_STATE
        case ADD_CATEGORY:
            return { ...state, CategoryData: action.payload };
        default:
            return state;
    }
};

