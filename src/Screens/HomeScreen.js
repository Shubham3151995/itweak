import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Keyboard,
  TouchableOpacity,
  FlatList,
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

  const data = [
    {
      title: "Have twerk challenge",
      image: require("../assets/video/Rectangle508.png"),
    },
    {
      title: "Video title",
      image: require("../assets/video/Rectangle507.png"),
    },
    {
      title: "Video title",
      image: require("../assets/video/Rectangle511.png"),
    },
    {
      title: "Video title",
      image: require("../assets/video/Rectangle513.png"),
    },
    {
      title: "Video title",
      image: require("../assets/video/Rectangle515.png"),
    },
    {
      title: "Video title",
      image: require("../assets/video/Rectangle517.png"),
    },
  ];

  const Component = ({ item, index }) => {
    console.log("===>", item, index % 2 === 0, index);
    return (
      <View
        style={{
          // width: "42%",
          marginLeft: 10,
          alignItems: "center",
          marginBottom: verticalScale(10),
          // marginLeft: index % 2 === 0 ? scale(30) : 0,
        }}
      >
        <View
          style={{
            backgroundColor: "black",
            alignItems: "center",
            paddingHorizontal: scale(10),
            justifyContent: "center",
          }}
        >
          <Image
            source={item.image}
            style={{ width: scale(110), height: verticalScale(180) }}
            // resizeMode="contain"
          />
          <Image
            source={require("../assets/images/play-button10.png")}
            style={{
              width: scale(30),
              height: verticalScale(30),
              position: "absolute",
            }}
            // resizeMode="contain"
          />
        </View>

        <Text style={{ fontStyle: Config.fonts.REGULAR, color: "black" }}>
          {item.title}
        </Text>
      </View>
    );
  };
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
      </View>
      <View
        style={{
          flex: 1,
          marginTop: verticalScale(30),
          paddingBottom: verticalScale(50),
        }}
      >
        <FlatList
          data={data}
          keyExtractor={(item, index) => {
            index;
          }}
          renderItem={Component}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            marginBottom: verticalScale(50),
          }}
        />
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
