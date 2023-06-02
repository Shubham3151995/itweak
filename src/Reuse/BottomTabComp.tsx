import React from "react";
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Image,
  Platform,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
const screenWidth = Dimensions.get("window").width;

interface props {
  onPress?: () => void;
  is_empty?: boolean;
  onCategoriesPress?: () => void;
  onSearchPress?: () => void;
  categories?: boolean;
  search?: boolean;
}
const BottomTabComp = ({
  onPress,
  is_empty,
  onCategoriesPress,
  onSearchPress,
  categories,
  search,
}: props) => {
  return (
    // <View style={{backgroundColor:'rgba(52, 52, 52, 0)'}}>

    // <SafeAreaView style={styles.mainView}>
    <View style={styles.mainView}>
      {/* <TouchableOpacity>
        <Image
          source={require("../assets/images/plus.png")}
          style={{
            height: scale(30),
            width: scale(30),
            position: "absolute",
            top: verticalScale(-30),
            left: screenWidth / 2.5,
            zIndex: 1000,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity> */}
      <View style={styles.pacman}>
        <Image
          source={require("../assets/images/plus.png")}
          style={{
            height: scale(50),
            width: scale(50),
            position: "absolute",
            transform: [{ rotate: "225deg" }],
          }}
          resizeMode="contain"
        />
      </View>
      {/* <View style={styles.ovalBgH}> 
    <View style={styles.ovalBg}>
    </View>
</View> */}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity>
          <Image
            source={require("../assets/images/home.png")}
            style={{ tintColor: "black", height: scale(30), width: scale(30) }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../assets/images/Frame.png")}
            style={{
              tintColor: "black",
              height: scale(30),
              width: scale(30),
              marginLeft: scale(30),
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity>
          <Image
            source={require("../assets/images/noti.png")}
            style={{ tintColor: "black", height: scale(30), width: scale(30) }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../assets/images/Profile.png")}
            style={{
              tintColor: "black",
              height: scale(30),
              width: scale(30),
              marginLeft: scale(30),
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>

    // </SafeAreaView>
    // </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    // flex: 1,
    backgroundColor: "white",
    width: "100%",
    height: verticalScale(50),
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 3,
    borderTopColor: "#F1F1F1",
  },

  topPlusButton: {
    // position: 'absolute',
    padding: 8,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    bottom: scale(25),
    zIndex: 200,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
  },
  topPlusButton2: {
    // position: 'absolute',
    // padding: 8,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    // width: scale(60),
    height: scale(25),
    borderRadius: scale(30),
    // bottom: scale(25),
    // zIndex: 200,
    // shadowOffset: { width: 0, height: 5 },
    // shadowOpacity: 0.2,
  },
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: "transparent",
    bottom: 0,
    // zIndex: 1,
    width: "100%",
    height: scale(60),
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(50),
    paddingVertical: moderateScale(10),
    alignItems: "center",
    borderTopRightRadius: moderateScale(12),
    borderTopLeftRadius: moderateScale(12),
  },
  shadowBox: {
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowColor: "#F1F0EF",
    shadowOpacity: 4,
    borderColor: "#fff",
  },
  categoriesList: {
    height: moderateScale(35),
    width: moderateScale(35),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(5),
    zIndex: 4002,
  },
  shadowBoxPlus: {
    elevation: 1,
    shadowOffset: { width: 1, height: 2 },
    shadowColor: "#F1F0EF",
    shadowOpacity: 2,
    borderColor: "#fff",
  },
  ovalBgH: {
    overflow: "hidden",
    width: scale(60),
    height: verticalScale(60),
    position: "absolute",
    borderBottomEndRadius: scale(30),
    borderBottomLeftRadius: scale(30),
    left: scale(120),
    top: 10,
    backgroundColor: "transparent",
    transform: [{ scaleX: 7 }],
  },
  ovalBg: {
    backgroundColor: "#C1C1C1",
    width: scale(10),
    height: verticalScale(30),
    transform: [{ scaleX: 7 }],
  },
  pacman: {
    width: 0,
    height: 0,
    borderTopWidth: 40,
    borderTopColor: "#F1F1F1",
    borderLeftColor: "#F1F1F1",
    borderLeftWidth: 40,
    borderRightColor: "transparent",
    borderRightWidth: 40,
    borderBottomColor: "transparent",
    borderBottomWidth: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    transform: [{ rotate: "225deg" }],
    position: "absolute",
    top: verticalScale(-30),
    left: screenWidth / 2.5,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default BottomTabComp;
