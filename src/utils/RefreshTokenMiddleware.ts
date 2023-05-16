
// import { AUTH_ERROR, CLEAR_ALL } from '../redux/types';
import * as RootNavigation from '../navigation/RootNavigation'
// Middleware to clear user data and reset the navigation when the token has expired(AUTH_ERROR).
export const customMiddleware = store => next => action => {
    // if (action.type === AUTH_ERROR && store.getState().persistedReducer.token) {
    //     console.log("user not")
    //     RootNavigation.resetStack('SocialLoginScreen', { message: action.payload });
    //     store.dispatch({ type: CLEAR_ALL });
    // }
    next(action)
}