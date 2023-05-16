import React from "react";
import {
  Dimensions,
  PixelRatio,
  Platform,
  StyleSheet,
  Linking,
} from "react-native";


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;


/** Normalize size for different screen sizes */
const normalize = (size: number): number => {
  const scale = screenWidth / 320;
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};



export {
  screenHeight,
  screenWidth,
  normalize,
  
};
