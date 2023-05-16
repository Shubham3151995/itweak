import {
  AuthActionType,
  SET_USER_NUMBER,
  SET_USER_LOCATION,
  SET_USER_INFO,
  CLEAR_ALL,
  GET_TOKEN,
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
import { Log } from '../../utils/Logger';

export function setUserNumber(userNumber: number): AuthActionType {
  return {
    type: SET_USER_NUMBER,
    payload: {
      userNumber: userNumber,
    },
  };
}
export function storeUserDetails(userInfo: Object): AuthActionType {
  return {
    type: SET_USER_INFO,
    payload: {
      preference: userInfo,
    },
  };
}

export function storeUserCurrentLocation(location: Object) {
  return {
    type: SET_USER_LOCATION,
    payload: location,
  };
}
export function setAccessToken(token: string): AuthActionType {
  Log(token, 'token');
  return {
    type: GET_TOKEN,
    payload: token,
  };
}
export function clearAll(): AuthActionType {
  return {
    type: CLEAR_ALL,
    payload: {
      token: undefined,
    },
  };
}
export function storeContacts(userInfo) {
  return {
    type: GET_CONTACTS,
    payload: {
      userInfo
    },
  };
}

export function storeCategories(Categories) {
  return {
    type: GET_CATEGORIES,
    payload: {
      Categories
    },
  };
}

export function storeLanguages(userInfo) {
  return {
    type: GET_LANGUAGES,
    payload: {
      userInfo
    },
  };
}

export function storeCountries(data) {
  return {
    type: GET_COUNTRIES,
    payload: data,
  };
}

export function storeEvents(events) {
  return {
    type: GET_EVENTS,
    payload: events,
  };
}

export function storePosts(posts) {
  return {
    type: GET_POSTS,
    payload: posts,
  };
}


export function storeUser(info) {
  return {
    type: GET_USER,
    payload: info,
  };
}

export function storePlatform(info) {
  return {
    type: GET_PLATFORM,
    payload: info,
  };
}


export function storeCurruncy(info) {
  return {
    type: GET_CURRUNCY,
    payload: info,
  };
}

export function storeFilters(info) {
  return {
    type: GET_FILTERS,
    payload: info,
  };
}



export function SetCounty(info) {
  return {
    type: SET_COUNTRY,
    payload: info,
  };
}