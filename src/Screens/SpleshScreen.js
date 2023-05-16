import * as React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const SpleshScreen = () => {
  return (
    <View style={styles.mainView}>
      <Image
        source={require("../assets/images/splash.png")}
        style={styles.imageView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  imageView: {
    height: "100%",
    width: "100%",
  },
});
export default SpleshScreen;
