import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import HOC from "../HOC";
import { scale, verticalScale } from "react-native-size-matters";
import Config from "../utils/Config";
import TextInputComp from "../Reuse/TextInputComp";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Button from "../Reuse/Button";
import SignUp from "./SignUp";
import { useNavigation, useRoute } from "@react-navigation/native";
import Modal from "../Reuse/Modal";
import BottomTabComp from "../Reuse/BottomTabComp";

const HomeScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  let passwordRef = useRef();
  return (
    <View style={styles.mainView}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <Image
          source={require("../assets/images/appLogo.png")}
          style={[styles.imageView, { position: "absolute", zIndex: 1000 }]}
          resizeMode="contain"
        />
        <Image
          source={require("../assets/images/pster1.png")}
          style={styles.imageView2}
          resizeMode="contain"
        />
        <Text style={styles.textHEading}>SIGN IN TO CONTINUE </Text>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: verticalScale(-1),
          width: "100%",
        }}
      >
        <BottomTabComp />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "white",
    // alignItems: "center",
  },
  imageView: {
    height: verticalScale(80),
    width: "80%",
    marginTop: verticalScale(30),
  },
  imageView2: {
    height: verticalScale(150),
    width: "90%",
    marginTop: verticalScale(0),
  },
  textHEading: {
    fontFamily: Config.fonts.REGULAR,
    color: Config.colors.black,
    fontSize: scale(22),
    marginTop: verticalScale(20),
  },
  text: {
    fontFamily: Config.fonts.REGULAR,
    color: Config.colors.black,
    fontSize: scale(18),
  },
  EmailPasswordView: {
    paddingHorizontal: scale(10),
    marginTop: verticalScale(10),
  },
  bottomView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(50),
  },
});
export default HOC(HomeScreen);
