import {
    LOADING_STATUS,
    CLEAR_ALL,
    LoadingActionType
} from '../types';

export interface LoadingState {
    loadingStatus: boolean
}

const INITIAL_STATE: LoadingState = {
    loadingStatus: false,
};

export default (state = INITIAL_STATE, action: LoadingActionType): LoadingState => {
    switch (action.type) {
        case CLEAR_ALL:
            return INITIAL_STATE
        case LOADING_STATUS:
            return { ...state, loadingStatus: action.payload };
        default:
            return state;
    }
};

