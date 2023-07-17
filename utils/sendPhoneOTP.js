const {
  messagebirdkey,
  messagebirdkeylive,
  nodeEnv,
} = require("../config/appConfig");

var messagebird = require("messagebird")(messagebirdkeylive);

const sendPhoneOTP = async (otp, phone) => {
  try {
    // if (nodeEnv !== 'production') {
    //   phone = messagebirdTestPhone;
    // }
    if (phone && phone.length == 10) {
      phone = `+1${phone}`;
    }
    var params = {
      originator: "+12014835667",
      recipients: [phone],
      body: `Your One Time Password for Laundry Hero is ${otp}. This Password is valid for the next 5 minutes.`,
    };

    messagebird.messages.create(params, function (err, response) {
      if (err) {
        return console.log(err);
      } else {
        console.log(response);
        console.log("message has been sent.");
      }
    });

    return "";
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendPhoneOTP;
