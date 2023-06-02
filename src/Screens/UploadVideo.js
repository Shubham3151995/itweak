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


const UploadVideo = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
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
                    <Text style={[styles.textHEading, { fontSize: scale(22), }]}>UPLOAD VIDEOS AND PHOTOS </Text>

                    <TouchableOpacity style={styles.profile} >
                        <Image
                            source={require("../assets/images/add.png")}
                            style={styles.addImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <Text style={[styles.textHEading, { fontSize: scale(16), }]}>Upload video's and photos here </Text>
                </View>

                <View style={styles.EmailPasswordView}>
                    <Text style={styles.text}>NAME</Text>
                    <TextInputComp
                        placeholder="Enter Your Name"
                        value={name}
                        onChangeText={(txt) => setName(txt)}
                        returnKeyType={"next"}
                        onSubmitEditing={() => {
                            passwordRef.focus();
                        }}
                    />
                    <Text style={[styles.text, { marginTop: verticalScale(10) }]}>
                        DESCRIPTION
                    </Text>
                    <TextInputComp
                        secureTextEntry={true}
                        placeholder="Enter Description"
                        value={description}
                        onChangeText={(txt) => setDescription(txt)}
                        returnKeyType={"done"}
                        multiline={true}
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                        }}
                    />

                    <Button text={"UPLOAD"} style={{ marginTop: verticalScale(50) }} />
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
    profile: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        borderWidth: 2,
        borderStyle: "dashed",
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(20),
    },
    addImage: {
        width: scale(25),
        height: scale(25)
    },
    textHEading: {
        fontFamily: Config.fonts.REGULAR,
        color: Config.colors.black,
        marginTop: verticalScale(10),
    },
    text: {
        fontFamily: Config.fonts.REGULAR,
        color: Config.colors.black,
        fontSize: scale(18),
    },
    EmailPasswordView: {
        paddingHorizontal: scale(10),
        marginTop: verticalScale(20),
    },

});
export default HOC(UploadVideo);
