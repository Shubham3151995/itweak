// const sendEmailOTP = require("../utils/sendEmailOTP");
// const sendPhoneOTP = require("../utils/sendPhoneOTP");
// const {
//   sendEmailNotification,
//   sendInAppNotification,
//   sendSmsNotification,
// } = require("../utils/sendNotifications");

// const otpSendHandler = async (userContactKey, userContactValue) => {
//   let template_data, templateId;
//   template_data = await template.getTemplate({ templateType: "SEND_OTP" })

//   // Generate new OTP of 8 digits
//   const otp = Math.floor(10000000 + Math.random() * 90000000);
//   // Send otp
//   if (userContactKey === "email") {
//     if (template_data && template_data.length > 0 && template_data[0].status == true) {
//       templateId = template_data[0].template_id;
//       let data = {
//         email: userContactValue,
//         otp: otp
//       }
//       let msg = ""
//       sendEmailNotification(data, msg, templateId);

//     }
//     // await sendPhoneOTP(otp, userContactValue);
//   }
//   if (userContactKey === "phone") {
//     await sendPhoneOTP(otp, userContactValue);
//   }

//   return otp;
// };

// module.exports = { otpSendHandler };
