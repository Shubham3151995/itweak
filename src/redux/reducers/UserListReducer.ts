import {
    AuthActionType,
    CLEAR_ALL,
    SET_USERS_CARDS,
    SET_REWIND_CARDS
} from '../types';
import { User, UserCards } from '../../types/modals/User';

const INITIAL_STATE: UserCards = {
    userCards: [],
    rewindUsers: []
};

export default (state = INITIAL_STATE, action: AuthActionType): UserCards => {
    switch (action.type) {
        case CLEAR_ALL:
            return { ...state, token: undefined };
        // return INITIAL_STATE;
        case SET_USERS_CARDS:
            return {
                ...state,
                userCards: action.payload
            };
        case SET_REWIND_CARDS:
            return {
                ...state,
                rewindUsers: [...state.rewindUsers, action.payload]
            }
        default:
            return state;
    }
};
