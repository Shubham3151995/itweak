import { Alert, Text } from "react-native";
import { openSettings } from "react-native-permissions";
import React, { useRef, useState } from 'react';
import { ActionSheetCustom } from "react-native-actionsheet";
import { ijjhhhjjyuuhjkgfj, checkCamera, checkGallery } from "./PermissionsHandler";
// import DocumentPicker from "react-native-document-picker";
// import { EventRegister } from "react-native-event-listeners";
import ImagePicker from 'react-native-image-crop-picker';

export function showPermissionsBlocked() {
    Alert.alert(
        'Permissions Blocked',
        'Please grant permissions from app settings',
        [
            { text: 'Cancel', onPress: () => console.log('OK Pressed') },
            { text: 'Settings', onPress: () => { openSettings().catch(() => console.warn('cannot open settings')); } },
        ],
        { cancelable: false },
    );
}

// export function optionRed(label) {
//     return <Text style={{ fontSize: 16, fontFamily: fonts.medium, color: 'red' }}>{label}</Text>
// }

// export function option(label) {
//     return <Text style={{ fontSize: 16, fontFamily: fonts.medium }}>{label}</Text>
// }

// export function optionBold(label) {
//     return <Text style={{ fontSize: 16, fontFamily: fonts.bold, color: colors.appBlue }}>{label}</Text>
// }

export function openImagePicker(callback) {
    console.log("image picker call===>");
    // Open Image Library:
    // checkGallery(isGranted => {
    console.log("permittion get");
    if (true) {
        setTimeout(() => {
            ImagePicker.openPicker({
                width: 300,
                height: 300,
                mediaType: 'photo',
                cropping: true,
            }).then((response) => {
                let source = { uri: response.path };
                let arr = response.path.split('/')
                console.log(response.path)
                let fileName = arr[arr.length - 1]
                callback(source, fileName)
            });
        }, 300);
    }
    // })
}

export function openCamera(callback) {
    // Launch Camera:
    // checkCamera(isGranted => {
    // if (isGranted) {

    setTimeout(() => {
        ImagePicker.openCamera({
            width: 300,
            height: 300,
            mediaType: 'photo',
            cropping: true,
        }).then((response) => {
            let source = { uri: response.path };
            let arr = response.path.split('/')
            let fileName = arr[arr.length - 1]
            callback(source, fileName)
        });
    }, 500);
    // }
    // })
}

// export function openFilePicker(callback) {
//     checkGallery(isGranted => {
//         if (isGranted) {
//             setTimeout(() => {
//                 DocumentPicker.pick().then(result => {
//                     if (result.type == 'application/pdf' ||
//                         result.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
//                         result.type == 'application/msword'
//                     ) {
//                         if (result.size / 1000 > 200) {
//                             EventRegister.emit('snackBar', "Select file less than 200 KB.")
//                         } else {
//                             console.log(result)
//                             fetch(result.uri).then(res => {
//                                 res.blob().then(blob => {
//                                     callback(blob, result.name, result)
//                                 })
//                             })
//                         }
//                     } else {
//                         EventRegister.emit('snackBar', "Only DOC, DOCX and PDF are supported.")
//                     }
//                 }).catch(err => {
//                     console.log(err)
//                 })
//             }, 500);
//         }
//     })
// }