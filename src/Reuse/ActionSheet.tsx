import React from "react";
import { View } from "react-native";
import ActionSheet from "react-native-actionsheet";
import { openImagePicker, openCamera } from "./functions";

interface props {
  ActionSheetRef: any;
  getImage: (res) => void;
}

const ActionSheetShow = ({ ActionSheetRef, getImage }: props) => {
  return (
    <ActionSheet
      ref={ActionSheetRef}
      title={"Choose an action"}
      options={["Gallary", "Camera", "Cancal"]}
      cancelButtonIndex={2}
      // destructiveButtonIndex={1}
      onPress={(index) => {
        if (index == 1) {
          openCamera(getImage);
        } else if (index == 0) {
          openImagePicker(getImage);
        }
      }}
    />
  );
};

export default ActionSheetShow;
