import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
    Image
} from 'react-native';
import Config from '../utils/Config';
import { scale, verticalScale } from 'react-native-size-matters';

const ModalView = (
    { isVisible = false,
        msg = "Successfull",
        isButton = false,
        onYesClick,
        onNoClick
    }) => {
    const [modalVisible, setModalVisible] = useState(isVisible);
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={styles.centeredView}>
                    {!isButton ?
                        <View style={styles.modalView}>
                            <Image
                                source={require('../assets/images/questionmark.png')}
                                resizeMode='contain'
                                style={{ height: scale(130), width: scale(130) }}
                            />
                            <Text style={styles.modalText}>{msg}</Text>

                            <View style={styles.buttonView}>

                                <TouchableOpacity style={styles.yesButton}>
                                    <Text style={styles.buttonText}>Yes </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.noButton}>
                                    <Text style={[styles.buttonText, { color: 'black' }]}>NO   </Text>
                                </TouchableOpacity>

                            </View>

                        </View>
                        : <View style={styles.modalView}>
                            <Image
                                source={require('../assets/images/check.png')}
                                resizeMode='contain'
                                style={{ height: scale(130), width: scale(130) }}
                            />
                            <Text style={styles.modalText}>{msg}</Text>
                        </View>}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.9)'

    },
    modalView: {
        alignItems: 'center',
        width: '100%'
    },

    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: Config.colors.white,
        marginTop: verticalScale(20)
    },
    buttonView: {
        flexDirection: "row",
        alignItems: 'center',
        // justifyContent: "space-between",
        paddingHorizontal: scale(15),
        marginTop: verticalScale(20),
        width: '100%',
        justifyContent: 'center'
    },
    yesButton: {
        backgroundColor: Config.colors.AppColor,
        height: verticalScale(45),
        width: "38%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    noButton: {
        backgroundColor: Config.colors.secondAppColor,
        height: verticalScale(45),
        width: "38%",
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: scale(20)
    },
    buttonText: {
        fontFamily: Config.fonts.REGULAR,
        fontSize: scale(18),

    }
});

export default ModalView;