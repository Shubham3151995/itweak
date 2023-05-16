import {
  AuthActionType,
  CLEAR_ALL,
  SET_USER_NUMBER,
  SET_USER_INFO,
  GET_TOKEN,
  UPDATE_PROFILE,
  GET_CONTACTS,
  GET_CATEGORIES,
  GET_LANGUAGES,
  GET_COUNTRIES,
  GET_EVENTS,
  GET_USER,
  GET_PLATFORM,
  GET_CURRUNCY,
  GET_FILTERS,
  GET_POSTS,
  SET_COUNTRY
} from '../types';
import { User } from '../../types/modals/User';
import { Log } from '../../utils/Logger';

const INITIAL_STATE: User = {
  token: undefined,
  preference: undefined,
  userNumber: undefined,
  contacts: [],
  fcmToken: undefined,
  categories: [],
  languages: [],
  countryies: [],
  events: [],
  userInfo: undefined,
  platforms: [],
  currency: [],
  filters: [],
  posts: [],
  county: undefined
};
export default (state = INITIAL_STATE, action: AuthActionType) => {
  switch (action.type) {
    case CLEAR_ALL:
      return { ...state, token: undefined, state: INITIAL_STATE };
    // return INITIAL_STATE;
    case SET_USER_NUMBER:
      return { ...state, userNumber: action.payload.userNumber };
    case SET_USER_INFO:
      return { ...state, preference: action.payload };
    case GET_TOKEN:
      return { ...state, token: action.payload };
    case GET_CONTACTS:
      return { ...state, contacts: action.payload };
    case GET_CATEGORIES:
      return { ...state, categories: action.payload };
    case UPDATE_PROFILE:
      return {
        ...state,
        preference: { ...action.payload },
      };
    case GET_LANGUAGES:
      return { ...state, languages: action.payload };
    case GET_COUNTRIES:
      return { ...state, countryies: action.payload };
    case GET_EVENTS:
      return { ...state, events: action.payload };
    case GET_USER:
      return { ...state, userInfo: action.payload };
    case GET_PLATFORM:
      return { ...state, platforms: action.payload };
    case GET_CURRUNCY:
      return { ...state, currency: action.payload };
    case GET_FILTERS:
      return { ...state, filters: action.payload };
    case GET_POSTS:
      return { ...state, posts: action.payload };
    case SET_COUNTRY:
      return { ...state, county: action.payload };
    default:
      return state;
  }
};
