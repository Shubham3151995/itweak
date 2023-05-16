import {
    SET_ACTIVE_SCREEN,
    CLEAR_ALL,
    ActiveScreenActionType
} from '../types';

export interface ScreenName {
    activeScreen: string
}

const INITIAL_STATE: ScreenName = {
    activeScreen: '',
};

export default (state = INITIAL_STATE, action: ActiveScreenActionType): ScreenName => {
    switch (action.type) {
        case CLEAR_ALL:
            return INITIAL_STATE
        case SET_ACTIVE_SCREEN:
            console.log(action.payload, "<===rd")
            return { ...state, activeScreen: action.payload };
        default:
            return state;
    }
};
