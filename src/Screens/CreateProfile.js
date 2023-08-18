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
import ResetPassword from "./ResetPassword";
import { useNavigation, useRoute } from "@react-navigation/native";
import UploadVideo from "./UploadVideo";
import ActionSheet from "../Reuse/ActionSheet";

const CreateProfile = () => {
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [contact, setContact] = useState("");
  const [about, setAbout] = useState("");
  const [addressError, setAddressError] = useState("");
  const [dateError, setDateError] = useState("");
  const [contactError, setContactError] = useState("");
  const [aboutError, setAboutError] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const navigation = useNavigation();

  let passwordRef = useRef();
  let actionSheetRef = useRef();

  const uploadProfile = async () => {
    if (address.trim() == "") {
      setAboutError("Please enter your address");
    } else if (date.trim() == "") {
      setDateError("Please enter your date of birth");
    } else if (contact.trim() == "") {
      setContactError("Please enter your contect number");
    } else if (about.trim() == "") {
      setAboutError("Please enter about");
    } else {
    }
  };

  const onGetImage = async (res) => {
    console.log("get Image===>", res);
    // setImageUrl(res.uri);
    // uploadImage(res);
    setProfileImage(res.uri);
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

          <Text style={styles.textHEading}>CREATE PROFILE </Text>
          {profileImage !== "" ? (
            <TouchableOpacity
              onPress={() => actionSheetRef.show()}
              style={styles.profileImage}
            >
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => actionSheetRef.show()}
              style={styles.profile}
            >
              <Image
                source={require("../assets/images/add.png")}
                style={styles.addImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.EmailPasswordView}>
          <Text style={styles.text}>ADDRESS</Text>
          <TextInputComp
            placeholder="Enter Your Address"
            value={address}
            onChangeText={(txt) => setAddress(txt)}
            returnKeyType={"next"}
            onSubmitEditing={() => {
              passwordRef.focus();
            }}
            validationMessage={addressError}
          />
          <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
            DATE OF BIRTH
          </Text>
          <TextInputComp
            placeholder="DD/MM/YYYY"
            value={date}
            onChangeText={(txt) => setDate(txt)}
            returnKeyType={"next"}
            validationMessage={dateError}
          />
          <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
            CONTACT NUMBER
          </Text>
          <TextInputComp
            placeholder="Enter Contact Number"
            value={contact}
            onChangeText={(txt) => setContact(txt)}
            keyboardType={"number-pad"}
            returnKeyType={"done"}
            multiline={false}
            validationMessage={contactError}
          />
          <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
            ABOUT
          </Text>
          <TextInputComp
            secureTextEntry={true}
            placeholder="About Me"
            value={about}
            onChangeText={(txt) => setAbout(txt)}
            returnKeyType={"done"}
            multiline={true}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            validationMessage={aboutError}
          />
        </View>
        <View style={styles.bottomView}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate("UploadVideo")}
          >
            <Text style={styles.buttonText}>NEXT </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "CreateProfile" }],
              });
              // navigation.navigate("EditProfile")
            }}
          >
            <Text style={[styles.buttonText, { color: "black" }]}>CANCEL </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ActionSheet
        ActionSheetRef={(o) => (actionSheetRef = o)}
        getImage={onGetImage}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "white",
  },
  imageView: {
    height: verticalScale(80),
    width: "80%",
    marginTop: verticalScale(30),
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
  profile: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  profileImage: {
    width: scale(120),
    height: scale(120),
    // borderRadius: scale(60),
    // borderWidth: 2,
    // borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  addImage: {
    width: scale(25),
    height: scale(25),
  },
  profileImage: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
  },
  EmailPasswordView: {
    paddingHorizontal: scale(10),
    marginTop: verticalScale(10),
  },
  bottomView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(15),
    marginTop: verticalScale(50),
  },
  nextButton: {
    backgroundColor: Config.colors.AppColor,
    height: verticalScale(45),
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Config.colors.secondAppColor,
    height: verticalScale(45),
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: Config.fonts.REGULAR,
    fontSize: scale(18),
  },
});
export default HOC(CreateProfile);
