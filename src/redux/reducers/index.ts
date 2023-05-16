import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import AuthReducer from './AuthReducer';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingReducer from './LoadingReducer';
import { persistReducer } from 'redux-persist';
import UserListReducer from './UserListReducer';
import PaymentCardsReducer from './PaymentCardsReducer'
import NotificationReducer from './NotificationReducer';
import SingleCategoriyReducer from './SingleCategoriyReducer'
const persistConfig = {
  storage: AsyncStorage,
  key: 'persistedReducer',
  version: 1,
};

const rootReducer = combineReducers({
  LoadingReducer: LoadingReducer,
  UserListReducer: UserListReducer,
  NotificationReducer: NotificationReducer,
  PaymentCardsReducer: PaymentCardsReducer,
  persistedReducer: persistReducer(persistConfig, AuthReducer),
  SingleCategoriyReducer: SingleCategoriyReducer,
});

const store = createStore(rootReducer, {}, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;
export default store;
