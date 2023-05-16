import { SET_ACTIVE_SCREEN } from '../types'

export function setActiveScreen(screenName: string) {
    return {
        type: SET_ACTIVE_SCREEN,
        payload: screenName
    };
}