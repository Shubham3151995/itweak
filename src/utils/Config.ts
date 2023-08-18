import { Platform } from 'react-native'
export default {
  server: {
    BASE_URL: "http://13.57.25.126:3000",
  },

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
    spaceRegEx: /^\S+$/,
  },
  error: {
    error_internet_connection:
      "It seems that you are offline.",
    error_empty_first_name: 'Please enter first name',
    error_first_name_numeric: 'First name cannot have numeric values',
    error_first_name_specialChar: 'First name cannot have special characters',
    error_first_name_long:
      'First name field cannot have more than 25 characters',
    error_first_name_space:
      'First name cannot contain whitespace',
    error_empty_lats_name: 'Please enter last name',
    error_last_name_numeric: 'Last name cannot have numeric values',
    error_last_name_specialChar: 'Last name cannot have special characters',
    error_last_name_long:
      'Last name field cannot have more than 25 characters',
    error_empty_email: 'Please enter email',
    error_invalid_email: 'Please enter a valid email address',
    error_empty_password: 'Please enter password',
    error_empty_confirm_password: 'Please enter confirm password',
    error_password_length: "Password must be greater than 8 and less than 32",
    error_password_not_Match: 'Confirm password not match',
    error_empty_name: 'Please enter full name',
    error_first_numeric: 'Full name cannot have numeric values',
    error_first_specialChar: 'Full name cannot have special characters',
    error_first_long:
      'Full name field cannot have more than 50 characters',
    error_empty_comment: "Please enter comment",
    error_last_name_space:
      'Last name cannot contain whitespace',
  },

};


