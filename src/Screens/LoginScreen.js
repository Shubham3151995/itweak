import * as React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import HOC from "../HOC";

const LoginScreen = () => {
  return (
    <View style={styles.mainView}>
      <Text>vansh</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "white",
  },
  imageView: {
    height: "100%",
    width: "100%",
  },
});
export default HOC(LoginScreen);
