import * as React from "react";
import { SafeAreaView, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Routes from "./navigations/Routes";
import { Provider } from "react-redux";
import store from "./redux/reducers";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import Config from "./utils/Config";

export default function App() {
  LogBox.ignoreAllLogs(true);
  const persistor = persistStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
