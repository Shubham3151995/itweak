import { User } from '../types/modals/User';

const LOADING_STATUS = 'LOADING_STATUS';
const CLEAR_ALL = 'CLEAR_ALL';
const AUTH_ERROR = 'AUTH_ERROR';
const SET_USER_NUMBER = 'SET_USER_NUMBER';
const SET_USER_INFO = 'SET_USER_INFO';
const GET_TOKEN = 'GET_TOKEN';
const UPDATE_PROFILE = 'UPDATE_PROFILE';
const SET_USER_LOCATION = 'SET_USER_LOCATION';
const SET_USERS_CARDS = 'SET_USERS_CARDS';
const SET_PAYMENT_CARDS = 'SET_PAYMENT_CARDS'
const SET_REWIND_CARDS = 'SET_REWIND_CARDS';
const SET_ACTIVE_SCREEN = 'SET_ACTIVE_SCREEN';
const GET_CONTACTS = 'GET_CONTACTS';
const GET_CATEGORIES = 'GET_CATEGORIES';
const CLEAR_CATEGORY = 'CLEAR_CATEGORY'
const ADD_CATEGORY = "ADD_CATEGORY";
const GET_LANGUAGES = 'GET_LANGUAGES';
const GET_COUNTRIES = 'GET_COUNTRIES';
const GET_EVENTS = "GET_EVENTS"
const GET_USER = "GET_USER"
const GET_PLATFORM = "GET_PLATFORM"
const GET_CURRUNCY = "GET_CURRUNCY"
const GET_FILTERS = 'GET_FILTERS'
const GET_POSTS = "GET_POSTS"
const SET_COUNTRY = "SET_COUNTRY"

export interface LoadingActionType {
  type: string;
  payload: boolean;
}

export interface ActiveScreenActionType {
  type: string;
  payload: string;
}

export interface AuthActionType {
  type
  payload
}

export interface ProfileType {
  type: String;
  payload: Object;
}

export type AppActionTypes = LoadingActionType | AuthActionType | ProfileType | ActiveScreenActionType;

export {
  LOADING_STATUS,
  CLEAR_ALL,
  AUTH_ERROR,
  SET_USER_NUMBER,
  SET_USER_INFO,
  GET_TOKEN,
  UPDATE_PROFILE,
  SET_USER_LOCATION,
  SET_USERS_CARDS,
  SET_PAYMENT_CARDS,
  SET_ACTIVE_SCREEN,
  SET_REWIND_CARDS,
  GET_CONTACTS,
  GET_CATEGORIES,
  CLEAR_CATEGORY,
  ADD_CATEGORY,
  GET_LANGUAGES,
  GET_COUNTRIES,
  GET_EVENTS,
  GET_USER,
  GET_PLATFORM,
  GET_CURRUNCY,
  GET_FILTERS,
  GET_POSTS,
  SET_COUNTRY
};
