const sgMail = require("@sendgrid/mail");
const {
  sendgridApiKey,
  sendgridTestMail,
  sendgridSenderMail,
  nodeEnv,
  messagebirdkey,
} = require("../config/appConfig");

const sendEmailOTP = async (otp, email,templateId) => {
  // if (nodeEnv !== 'production') {
  //   email = sendgridTestMail;
  // }
  try {
    sgMail.setApiKey(sendgridApiKey);
    const msg = {
      to: email,
      from: {
        name: "Laundry Hero",
        email: sendgridSenderMail,
      },
      subject: "Email Validation",
      text: `Your LaundryHero validation code is ${otp}.`,
      // templateId: "d-277c487d9ea34f43a0cb3ed7af7614a4",
      // dynamic_template_data: {
      //   subject: "Email Validation",
      //   otp: otp,
      //   verify_link: "http://localhost:3001/verify-account",
      //   // otp: data.otp,
      // },
    };
    const sent = await sgMail.send(msg);
    return sent;
  } catch (err) {
    // res.send(502).send({ message: err });
    console.log(err, "error");
  }
};

module.exports = sendEmailOTP;
