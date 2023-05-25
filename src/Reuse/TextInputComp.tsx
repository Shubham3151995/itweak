import React from 'react';
import {
  ViewStyle,
  StyleProp,
  TextInput,
  KeyboardTypeOptions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Config from '../utils/Config';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import { getIcons, Icons } from '../../assets/Icons';


interface Props {
  value: string | undefined;
  editable?: boolean;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  getInputRef?: (ref: TextInput | null) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'none' | 'done' | 'next';
  validationMessage?: string;
  multiline?: boolean;
  text?: string;
  is_icon?: boolean
  userData?: any
  onPressEdit?: (text: string) => void;
  isSearchIcon?: boolean
  textStyle: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  props: any
  onKeyPress: (text: any) => void
}

const TextInputComp = ({
  value,
  placeholder,
  onChangeText,
  keyboardType,
  secureTextEntry = false,
  autoCapitalize,
  maxLength,
  style,
  editable = true,
  getInputRef,
  onSubmitEditing,
  returnKeyType,
  validationMessage,
  multiline,
  text,
  is_icon,
  userData,
  onPressEdit,
  isSearchIcon,
  textStyle,
  containerStyle,
  props,
  onKeyPress
}: Props) => {
  return (
    <View
      style={[styles.mainContainer, containerStyle]}>
      <View style={[
        {
          height: scale(50),
          borderWidth:  0,
          borderColor:Config.colors.black,
          borderRadius: scale(5),
          paddingLeft: moderateScale(10),
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: scale(5),
          backgroundColor: Config.colors.black
        },
        style,
      ]}>
        
        <TextInput
          value={value}
          maxLength={maxLength}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          multiline={multiline}
          onKeyPress={onKeyPress}
          editable={editable}
          placeholderTextColor={Config.colors.white}
          style={[
            {
              color: Config.colors.white,
              // fontSize: scale(11.5),
              fontFamily: Config.fonts.REGULAR,
              flex: 1,
              marginLeft: scale(10)
            },
            style,
          ]}
          returnKeyType={returnKeyType}
          placeholder={placeholder}
          blurOnSubmit={false}
          textContentType="telephoneNumber"
          ref={(ref) => {
            if (getInputRef) getInputRef(ref);
          }}
        />
      </View>
      {validationMessage && (
        <Text
          style={styles.text}>
          {validationMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  text: {
    marginLeft: moderateScale(5),
    color: 'red',
    fontSize: moderateScale(11),
  },
  textHeading: {
    color: Config.colors.AppColor,
    fontFamily: Config.fonts.BOLD,
    fontSize: scale(13),
    marginLeft: moderateScale(15),
    marginBottom: scale(5)
  },
  
 
})

export default TextInputComp
