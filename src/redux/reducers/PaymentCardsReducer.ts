import {
    AuthActionType,
    CLEAR_ALL,
    SET_PAYMENT_CARDS,
} from '../types';
import { PaymentCards } from '../../types/modals/User';
const INITIAL_STATE: PaymentCards = {
    paymentCards: []
};

export default (state = INITIAL_STATE, action: AuthActionType): PaymentCards => {
    switch (action.type) {
        case CLEAR_ALL:
            return INITIAL_STATE;
        case SET_PAYMENT_CARDS:
            return { paymentCards: action.payload };
        default:
            return state;
    }
};
