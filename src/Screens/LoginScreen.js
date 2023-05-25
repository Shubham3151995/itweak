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

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let passwordRef = useRef();
  return (
    <KeyboardAwareScrollView
      enableAutomaticScroll={Platform.OS === "ios" ? true : true}
      keyboardShouldPersistTaps={"handled"}
      enableOnAndroid={true}
      showsVerticalScrollIndicator={false}
      style={styles.mainView}
    >
      <View style={styles.mainView}>
        <View style={{ alignItems: "center", width: "100%" }}>
          <Image
            source={require("../assets/images/appLogo.png")}
            style={styles.imageView}
            resizeMode="contain"
          />
          <Image
            source={require("../assets/images/pster1.png")}
            style={styles.imageView2}
            resizeMode="contain"
          />
          <Text style={styles.textHEading}>SIGN IN TO CONTINUE </Text>
        </View>

        <View style={styles.EmailPasswordView}>
          <Text style={styles.text}>Email</Text>
          <TextInputComp
            placeholder="ENTER EMAIL ADDRESS"
            value={email}
            onChangeText={(txt) => setEmail(txt)}
            keyboardType={"email-address"}
            returnKeyType={"next"}
            onSubmitEditing={() => {
              passwordRef.focus();
            }}
          />
          <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
            PASSWORD
          </Text>
          <TextInputComp
            secureTextEntry={true}
            placeholder="ENTER PASSWORD"
            value={password}
            onChangeText={(txt) => setPassword(txt)}
            keyboardType={"email-address"}
            getInputRef={(ref) => (passwordRef = ref)}
            returnKeyType={"done"}
            multiline={false}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
          />
          <TouchableOpacity>
            <Text
              style={[
                styles.text,
                { marginTop: verticalScale(20), alignSelf: "flex-end" },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <Button text={"SIGN IN"} style={{ marginTop: verticalScale(20) }} />
        </View>
        <View style={styles.bottomView}>
          <Text style={[styles.text]}>DON'T HAVE AN ACCOUNT ? </Text>
          <TouchableOpacity>
            <Text style={[styles.text, { color: Config.colors.AppColor }]}>
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
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
export default HOC(LoginScreen);
