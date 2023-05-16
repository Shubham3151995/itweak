import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const SpleshScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      hideSpleshScreen();
    }, 1500);
  }, []);

  const hideSpleshScreen = () => {
    // navigation.navigate("ProfileScreen", { posts: true });
    // navigation.goBack()
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };
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
