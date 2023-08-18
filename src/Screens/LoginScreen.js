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
import { validateLogin } from "../utils/ValidationHelper";
import { LoginAction } from "../redux/actions/AuthActions";
import { useSelector, useDispatch } from "react-redux";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigation = useNavigation();
  let passwordRef = useRef();
  const dispatch = useDispatch();

  const onLogin = async () => {
    const data = {
      email: email,
      password: password,
    };
    const res = await validateLogin(data);

    if (res.code == 200) {
      const loginRes = await dispatch(LoginAction(JSON.stringify(data)));
      if (loginRes.code == 200) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    } else {
      console.log("error===>", res);
      setEmailError(res.validationObject);
    }
  };
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
          <Text style={styles.text}>EMAIl</Text>
          <TextInputComp
            placeholder="Enter Email Address"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setEmailError({ ...emailError, emailError: null });
            }}
            keyboardType={"email-address"}
            returnKeyType={"next"}
            onSubmitEditing={() => {
              passwordRef.focus();
            }}
            validationMessage={emailError?.emailError}
          />
          <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
            PASSWORD
          </Text>
          <TextInputComp
            secureTextEntry={true}
            placeholder="Enter Password"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setEmailError({ ...emailError, passwordError: null });
            }}
            keyboardType={"email-address"}
            getInputRef={(ref) => (passwordRef = ref)}
            returnKeyType={"done"}
            multiline={false}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            validationMessage={emailError?.passwordError}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <Text
              style={[
                styles.text,
                { marginTop: verticalScale(20), alignSelf: "flex-end" },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <Button
            onPress={() => {
              // onLogin();
              navigation.navigate("CreateProfile");
            }}
            text={"SIGN IN"}
            style={{ marginTop: verticalScale(20) }}
          />
        </View>
        <View style={styles.bottomView}>
          <Text style={[styles.text]}>DON'T HAVE AN ACCOUNT ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={[styles.text, { color: Config.colors.AppColor }]}>
              SIGN UP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <Modal
        isVisible={true}
      /> */}
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
