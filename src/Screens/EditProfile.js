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


const EditProfile = () => {
    const [address, setAddress] = useState("");
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");

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
                    <Text style={styles.textHEading}>EDIT PROFILE </Text>
                </View>

                <View style={styles.EmailPasswordView}>
                    <Text style={styles.text}>NAME</Text>
                    <TextInputComp
                        placeholder="Enter Name"
                        value={name}
                        onChangeText={(txt) => setName(txt)}
                        returnKeyType={"next"}
                        onSubmitEditing={() => {
                            passwordRef.focus();
                        }}
                    />
                    <Text style={[styles.text, { marginTop: verticalScale(10) }]}>ADDRESS</Text>
                    <TextInputComp
                        placeholder="Enter Your Address"
                        value={address}
                        onChangeText={(txt) => setAddress(txt)}
                        returnKeyType={"next"}
                        onSubmitEditing={() => {
                            passwordRef.focus();
                        }}
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
                        style={{ minHeight: scale(80) }}
                    />
                    <Button text={"UPDATE PROFILE"} style={{ marginTop: verticalScale(60) }} />

                </View>

            </View>
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

});
export default HOC(EditProfile);
