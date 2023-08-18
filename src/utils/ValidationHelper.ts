import config from './Config';

export interface LoginType {
  email: string;
  password: string;
}
export interface ValidationLoginType {
  emailError: string;
  passwordError: string;
}

export interface SignUpType {
  fname: string
  lname: string
  email: string
  password: string
  confirmPassword: string
}
export interface ValidationSignUpType {
  fnameError: string
  lnameError: string
  emailError: string
  passwordError: string
  confirmPasswordError: string
}

export interface ChangePasswordType {
  old_password: string
  new_password: string
  confirm_password: string
}
export interface ValidationChangePasswordType {
  old_passwordError: string
  new_passwordError: string
  confirm_passwordError: string
}

export interface UpdateProfileType {
  first_name: string
  last_name: string
}
export interface ValidationUpdateProfileType {
  first_nameError: string
  last_nameError: string
}

export interface FeedbackType {
  full_name: string
  email_address: string
  user_comment_for_feedback: string
}
export interface ValidationFeedbackType {
  full_nameError: string
  email_addressError: string
  user_comment_for_feedbackError: string
}

export interface ForgotPasswordType {
  email: string
}
export interface ValidationForgotPasswordType {
  emailError: string
}



/**
 * validation for create accunt feilds 
 * @param detailObj 
 * @returns 
 */
export const validateSignUp = (detailObj: SignUpType): Promise<ValidationSignUpType | string> => {
  const obj: ValidationSignUpType = {};

  return new Promise((resolve, reject) => {
    if (!detailObj.fname) {
      obj.fnameError = config.error.error_empty_first_name;
    } else if (detailObj.fname.trim() == "") {
      obj.fnameError = config.error.error_empty_first_name;
    }
    else if (
      !obj.fnameError &&
      config.regex.numericRegEx.test(detailObj.fname)
    ) {
      obj.fnameError = config.error.error_first_name_numeric;
    } else if (
      !obj.fnameError &&
      config.regex.specialCharRegEx.test(detailObj.fname)
    ) {
      obj.fnameError = config.error.error_first_name_specialChar;
    } else if (!obj.fnameError && detailObj.fname.length > 25) {
      obj.fnameError = config.error.error_first_name_long;
    }
    else if (!obj.fnameError && !config.regex.spaceRegEx.test(detailObj.fname.trim())) {
      obj.fnameError = config.error.error_first_name_space;
    }
    if (!detailObj.lname) {
      obj.lnameError = config.error.error_empty_lats_name
    } else if (detailObj.lname.trim() == "") {
      obj.lnameError = config.error.error_empty_lats_name
    }
    else if (
      !obj.lnameError &&
      config.regex.numericRegEx.test(detailObj.lname)
    ) {
      obj.lnameError = config.error.error_last_name_numeric;
    } else if (
      !obj.lnameError &&
      config.regex.specialCharRegEx.test(detailObj.lname)
    ) {
      obj.lnameError = config.error.error_last_name_specialChar;
    } else if (!obj.lnameError && detailObj.lname.length > 25) {
      obj.lnameError = config.error.error_last_name_long;
    } else if (!obj.lnameError && !config.regex.spaceRegEx.test(detailObj.lname.trim())) {
      obj.lnameError = config.error.error_last_name_space;
    }

    if (!detailObj.email) {
      obj.emailError = config.error.error_empty_email;
    } else if (detailObj.email.trim() == "") {
      obj.emailError = config.error.error_empty_email;
    }
    else if (!obj.emailError && !config.regex.regExEmail.test(detailObj.email)) {
      obj.emailError = config.error.error_invalid_email;
    }


    if (!detailObj.password) {
      obj.passwordError = config.error.error_empty_password;
    } else if (detailObj.password.trim() == "") {
      obj.passwordError = config.error.error_empty_password;
    } else if (detailObj.password.length < 8 || detailObj.password.length > 32) {
      obj.passwordError = config.error.error_password_length
    }
    if (!detailObj.confirmPassword) {
      obj.confirmPasswordError = config.error.error_empty_confirm_password
    } else if (detailObj.confirmPassword.trim() == "") {
      obj.confirmPasswordError = config.error.error_empty_confirm_password
    } else if (detailObj.confirmPassword.length < 8 || detailObj.confirmPassword.length > 32) {
      obj.confirmPasswordError = config.error.error_password_length
    }
    else if (detailObj.confirmPassword !== detailObj.password) {
      obj.confirmPasswordError = config.error.error_password_not_Match
    }

    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};


/**
 * validation for login 
 * @param data 
 * @returns 
 */
export const validateLogin = (data: LoginType): Promise<ValidationLoginType | string> => {
  const obj: ValidationLoginType = {};

  return new Promise((resolve, reject) => {
    if (!data.email) {
      obj.emailError = config.error.error_empty_email
    } else if (data.email.trim() == '')
      obj.emailError = config.error.error_empty_email
    else if (
      !obj.emailError &&
      !config.regex.regExEmail.test(data.email)
    ) {
      obj.emailError = config.error.error_invalid_email
    }
    if (!data.password) {
      obj.passwordError = config.error.error_empty_password;
    }
    else if (data.password.trim() == '') {
      obj.passwordError = config.error.error_empty_password;
    } else if (data.password.length < 6) {
      obj.passwordError = config.error.error_password_length
    }


    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};


/**
 * validation for change password 
 * @param detailObj 
 * @returns 
 */
export const validateChangePassowrd = (detailObj: ChangePasswordType): Promise<ValidationChangePasswordType | string> => {
  const obj: ValidationChangePasswordType = {};

  return new Promise((resolve, reject) => {

    if (!detailObj.old_password) {
      obj.old_passwordError = config.error.error_empty_password;
    } else if (detailObj.old_password.trim() == "") {
      obj.old_passwordError = config.error.error_empty_password;
    } else if (detailObj.old_password.length < 6) {
      obj.old_passwordError = config.error.error_password_length
    }
    if (!detailObj.new_password) {
      obj.new_passwordError = config.error.error_empty_password;
    } else if (detailObj.new_password.trim() == "") {
      obj.new_passwordError = config.error.error_empty_password;
    } else if (detailObj.new_password.length < 8 || detailObj.new_password.length > 32) {
      obj.new_passwordError = config.error.error_password_length
    }
    if (!detailObj.confirm_password) {
      obj.confirm_passwordError = config.error.error_empty_confirm_password
    } else if (detailObj.confirm_password.trim() == "") {
      obj.confirm_passwordError = config.error.error_empty_confirm_password
    } else if (detailObj.confirm_password.length < 8 || detailObj.confirm_password.length > 32) {
      obj.confirm_passwordError = config.error.error_password_length
    }
    else if (detailObj.confirm_password !== detailObj.new_password) {
      obj.confirm_passwordError = config.error.error_password_not_Match
    }


    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};


/**
 * validation for profile name 
 * @param detailObj 
 * @returns 
 */
export const validateProfile = (detailObj: UpdateProfileType): Promise<ValidationUpdateProfileType | string> => {
  const obj: ValidationUpdateProfileType = {};

  return new Promise((resolve, reject) => {
    if (!detailObj.first_name) {
      obj.first_nameError = config.error.error_empty_first_name;
    } else if (detailObj.first_name.trim() == "") {
      obj.first_nameError = config.error.error_empty_first_name;
    }
    else if (
      !obj.first_nameError &&
      config.regex.numericRegEx.test(detailObj.first_name)
    ) {
      obj.first_nameError = config.error.error_first_name_numeric;
    } else if (
      !obj.first_nameError &&
      config.regex.specialCharRegEx.test(detailObj.first_name)
    ) {
      obj.first_nameError = config.error.error_first_name_specialChar;
    } else if (!obj.first_nameError && detailObj.first_name.length >= 25) {
      obj.first_nameError = config.error.error_first_name_long;
    }
    if (!detailObj.last_name) {
      obj.last_nameError = config.error.error_empty_lats_name
    } else if (detailObj.last_name.trim() == "") {
      obj.last_nameError = config.error.error_empty_lats_name
    }
    else if (
      !obj.last_nameError &&
      config.regex.numericRegEx.test(detailObj.last_name)
    ) {
      obj.last_nameError = config.error.error_last_name_numeric;
    } else if (
      !obj.last_nameError &&
      config.regex.specialCharRegEx.test(detailObj.last_name)
    ) {
      obj.last_nameError = config.error.error_last_name_specialChar;
    } else if (!obj.last_nameError && detailObj.last_name.length >= 25) {
      obj.last_nameError = config.error.error_last_name_long;
    }


    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};

/**
 * validation for feedback form
 * @param detailObj 
 * @returns 
 */

export const validateFeedback = (detailObj: FeedbackType): Promise<ValidationFeedbackType | string> => {
  const obj: ValidationFeedbackType = {};

  return new Promise((resolve, reject) => {
    if (!detailObj.full_name) {
      obj.full_nameError = config.error.error_empty_name;
    } else if (detailObj.full_name.trim() == "") {
      obj.full_nameError = config.error.error_empty_name;
    }
    else if (
      !obj.full_nameError &&
      config.regex.numericRegEx.test(detailObj.full_name)
    ) {
      obj.full_nameError = config.error.error_first_numeric;
    } else if (
      !obj.full_nameError &&
      config.regex.specialCharRegEx.test(detailObj.full_name)
    ) {
      obj.full_nameError = config.error.error_first_specialChar;
    } else if (!obj.full_nameError && detailObj.full_name.length >= 50) {
      obj.full_nameError = config.error.error_first_long;
    }
    if (!detailObj.email_address) {
      obj.email_addressError = config.error.error_empty_email
    } else if (detailObj.email_address.trim() == '')
      obj.email_addressError = config.error.error_empty_email
    else if (
      !obj.email_addressError &&
      !config.regex.regExEmail.test(detailObj.email_address)
    ) {
      obj.email_addressError = config.error.error_invalid_email
    }
    if (!detailObj.user_comment_for_feedback) {
      obj.user_comment_for_feedbackError = config.error.error_empty_comment
    } else if (detailObj.user_comment_for_feedback.trim() == '')
      obj.user_comment_for_feedbackError = config.error.error_empty_comment


    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};



export const validateForgotPassword = (data: ForgotPasswordType): Promise<ValidationForgotPasswordType | string> => {
  const obj: ValidationForgotPasswordType = {};

  return new Promise((resolve, reject) => {
    if (!data.email) {
      obj.emailError = config.error.error_empty_email
    } else if (data.email.trim() == '')
      obj.emailError = config.error.error_empty_email
    else if (
      !obj.emailError &&
      !config.regex.regExEmail.test(data.email)
    ) {
      obj.emailError = config.error.error_invalid_email
    }


    if (Object.keys(obj).length != 0) {
      resolve({
        code: 405,
        validationObject: obj
      });
    } else {
      resolve({ code: 200 });
    }
  });
};
