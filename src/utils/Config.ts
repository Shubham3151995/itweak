import { Platform } from 'react-native'
export default {
  // server: {
  //   BASE_URL: LOCAL_URL,
  // },

  fonts: {
    BOLD: 'BigShouldersDisplay-Bold',
    SEMI_BOLD: "BigShouldersDisplay-SemiBold",
    MEDIUM: 'BigShouldersDisplay-Medium',
    REGULAR: 'BigShouldersDisplay-Regular',
    ExtraLight: 'BigShouldersDisplay-ExtraLight',
    LIGHT: 'BigShouldersDisplay-Light',
    ExtraBold:"BigShouldersDisplay-ExtraBold",
    Thin:'BigShouldersDisplay-Thin'
  },
  colors: {
    AppColor: "#FF009A",
    white: "white",
    gray: "#B5B5B5",
    dimAppcolor: '#EDF4FB',
    fontGray: '#888C96',
    lightYellow: '#FFF8F2',
    lightGray: '#F2EEEB',
    black: '#000000',
    secondAppColor:'#60FAFF'
    // secondaryColor:'#FFF8F2'
  },

  constants: {
    facebook: 'facebook',
    apple: 'apple',
    google: 'google',
  },
  regex: {
    regExEmail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    nameRegEx: /^([a-zA-Z]+\s)*[a-zA-Z]+$/,
    numericRegEx: /\d/,
    specialCharRegEx: /[^a-zA-Z ]/,
  },
  error: {
    error_internet_connection:
      'Something went wrong!! Please check your internet and try again',
    error_empty_first_name: 'Please enter Name',
    error_first_name_numeric: 'Name cannot have numeric values',
    error_first_name_specialChar: 'Name cannot have special characters',
    error_first_name_long:
      'Name field cannot have more than 100 characters',
    error_empty_know_from: 'Please enter Know From',
    error_know_from_long:
      'Know from field cannot have more than 200 characters',
    error_bgcolor: 'Please select any color',
    error_empty_characteristic: 'Please enter Characteristic',
    error_characteristic_long:
      'Characteristic field cannot have more than 500 characters',
    error_empty_info: 'Please enter Info',
    error_info_long:
      'Info field cannot have more than 500 characters',
    error_empty_notes: 'Please enter Notes',
    error_notes_long:
      'Notes field cannot have more than 500 characters',
    error_empty_email: 'Please enter the email',
    error_invalid_email: 'Please enter a valid email address',
    error_empty_Cat_title: 'Please enter Title',
    error_empty_Cat_bgcolor: 'Please select any color',
  },

};


