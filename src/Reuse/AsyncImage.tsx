import React from "react";
import { View, Image, ActivityIndicator } from "react-native";

//component for load image
interface props {
  source: string;
  placeholderColor?: string;
  style: Object;
  loaderColor?: string;
  placeholderImageUrl?: string;
  setResizeMode?: string;
}
const AsyncImage = ({
  source,
  placeholderColor,
  style,
  loaderColor,
  placeholderImageUrl,
  setResizeMode = "cover",
}: props) => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const onLoadingImage = () => {
    setLoaded(true);
  };
  return (
    <View>
      {/* when image is loaded from url */}
      <Image
        source={{ uri: source }}
        resizeMode={setResizeMode}
        style={[
          style,
          {
            // resizeMode: 'cover'
          },
        ]}
        onLoad={() => onLoadingImage()}
      />
      {/* show when image is not load */}
      {!loaded && (
        <>
          {/* when we want a image as a plaseholder */}
          {placeholderImageUrl ? (
            <Image
              style={[
                style,
                {
                  resizeMode: "contain",
                },
              ]}
              source={placeholderImageUrl}
            />
          ) : (
            // when we wants a color as a plaseholder
            <View
              style={[
                style,
                {
                  backgroundColor: placeholderColor,
                  position: "absolute",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {loaderColor && (
                <ActivityIndicator
                  color={loaderColor ? loaderColor : "black"}
                  size="large"
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default AsyncImage;
