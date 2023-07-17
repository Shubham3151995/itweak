const moment = require("moment");
var smtpTransport = require("nodemailer-smtp-transport");
var nodemailer = require("nodemailer");

const sendEmailNotification = async (email, htmlBody, subject) => {
  try {
    var smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kajal_kashyap@softprodigy.com",
        pass: "dkjrheehmgrefujp",
      },
    });
    var mailOptions = {
      from: "kajalkashyap41@gmail.com",
      to: email,
      subject: subject,
      html: htmlBody,
    };
    let mail = smtpTransport.sendMail(mailOptions);
    return mail;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  sendEmailNotification,
};
