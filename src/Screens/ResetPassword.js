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
import LoginScreen from "./LoginScreen";
import { useNavigation, useRoute } from "@react-navigation/native";
import CreateProfile from "./CreateProfile";


const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const navigation = useNavigation();
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
                    <Text style={styles.textHEading}>RESET PASSWORD </Text>
                </View>

                <View style={styles.EmailView}>
                    <Text style={styles.text}>EMAIl</Text>
                    <TextInputComp
                        placeholder="Enter Email Address"
                        value={email}
                        onChangeText={(txt) => setEmail(txt)}
                        keyboardType={"email-address"}
                        returnKeyType={"next"}
                        onSubmitEditing={() => {
                            passwordRef.focus();
                        }}
                    />

                    <Button text={"RESET PASSWORD"} style={{ marginTop: verticalScale(30) }}
                        onPress={() => { navigation.navigate("CreateProfile") }}></Button>
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
    EmailView: {
        paddingHorizontal: scale(10),
        marginTop: verticalScale(20),
    },

});
export default HOC(ResetPassword);
