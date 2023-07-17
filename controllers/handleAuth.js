const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Hero = require("../models/Heros");
const { otpSendHandler } = require("../services/otpHandler");
const { getAccessToken, getRefreshToken } = require("../utils/createJWT");
const { nodeEnv, refreshTokenSecret } = require("../config/appConfig");
const { accessTokenSecret } = require("../config/appConfig");
const BusinessAccount = require("../models/BusinessAccount");
const template = require("./handleTemplates");
const Subscription = require("../models/Subscription");
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const { createCustomer } = require("../services/stripe");
const {
  sendEmailNotification,
  sendInAppNotification,
  sendSmsNotification,
} = require("../utils/sendNotifications");
const Common = require("../utils/common");

const handleRegister = async (req, res) => {
  const { password, confirm_password, name, email } = req.body;
  // Confirm data
  if (!password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Check password length
  if (password.length < 8)
    return res
      .status(400)
      .json({ message: "Password can't be shorter than 8 characters" });

  if (password !== confirm_password)
    return res
      .status(400)
      .json({ message: "Confirm password should be same as password" });

  // Check if user exists
  const userExists = await User.findOne({ email: req.body.email });
  // console.log(userExists.otp[userContactKey], "333");

  if (userExists) {
    return res.status(400).json({ message: "User already registered" });
  }

  try {
    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds
    const hashedConfirmPwd = await bcrypt.hash(confirm_password, 10);
    const user = new User({
      password: hashedPwd,
      confirm_password: hashedConfirmPwd,
      name: req.body.name,
      email: req.body.email,
    });

    //create stripe customer
    // let newCutomer = await createCustomer({
    //   name: req.body.name,
    //   email: req.body.email
    // });
    // user.stripeCustomerId = newCutomer.id
    // Try to save data
    const savedUser = await user.save();
    res.status(200).json({ message: "User register successfully" });
  } catch (err) {
    console.log(err);
    err ? res.status(500).send({ message: err }) : res.sendStatus(400);
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  // Confirm data
  if (!password)
    return res.status(400).json({ message: "All Fields Are Required!" });

  try {
    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User Not Found!" });

    // Validate password
    const validatedUser = await bcrypt.compare(password, user.password);

    // On invalid password return error
    if (!validatedUser)
      return res.status(401).json({ message: "Invalid Credentials" });

    // Create access and refresh tokens
    const accessToken = getAccessToken(user.email, user._id);
    //Send Access Token
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const handleLogout = (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No content

  // clear cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: nodeEnv !== "development",
  });
  res.sendStatus(204);
};

const handleRefreshToken = async (req, res) => {
  // Refresh token will be received in cookies or body
  const cookies = req.body || req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  // Verify refresh token
  jwt.verify(refreshToken, refreshTokenSecret, async (err, decoded) => {
    if (err) return res.sendStatus(403);

    // Get userdata (phone or email) from the database
    const userData = decoded.data.contact;
    if (!userData) return res.sendStatus(404);

    // Check for email or phone in database
    let user = await User.findOne({ email: userData });
    if (!user) user = await User.findOne({ phone: userData });
    if (!user) return res.sendStatus(403);

    // Set user email in user data for jwts
    let userContact;
    if (user.email) {
      userContact = user.email;
    } else {
      userContact = user.phone;
    }

    // Get new access token
    const accessToken = getAccessToken(userContact, user.role, user._id);

    // Send new access token
    res.json({ accessToken });
  });
};

const handleSendOTP = async (req, res) => {
  // Get key i.e. email or phone as key
  const userContactKey = Object.entries(req.userContact)[0][0];

  // Get values of previous key
  const userContactValue = Object.entries(req.userContact)[0][1];
  // Check if user exists
  const user = await User.findOne({ [userContactKey]: userContactValue });
  if (!user) return res.status(409).json({ message: "User isn't registered" });
  let otp;
  try {
    if (user.notification.sms == true || user.notification.email == true) {
      otp = await otpSendHandler(userContactKey, userContactValue);
      user.otp[`${userContactKey}OTP`] = otp;
      await user.save();
      res.json({ message: "OTP has been sent to your email / phone" });
    } else {
      res.json({ message: "Otp didn't send" });
    }
  } catch (err) {
    res.status(400).send({ err });
  }
};
const forgotPassword = async (req, res) => {
  try {
    let user = await User.find({ email: req.body.email });
    if (user && user.length > 0) {
      let token = Date.now();
      await updateResetPasswordToken(user[0]._id, token);
      let verificationLink = `${process.env.RESET_PASSWORD_LINK}/${token}`;
      console.log("verif link", verificationLink);
      const subject = "Reset Password";
      const emailPayload = {
        name: user[0].name,
        email: user[0].email,
        link: verificationLink,
      };
      const htmlBody = await Common.editEmailTemplate(
        "./config/resetPasswordTemplate.html",
        emailPayload
      );
      await sendEmailNotification(user[0].email, htmlBody, subject);
      res
        .status(200)
        .json({ message: "Reset password link sent to your email" });
    } else {
      throw "Please enter correct email";
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};
async function updateResetPasswordToken(userId, token) {
  try {
    await User.updateOne(
      { _id: userId },
      { $set: { reset_password_token: token } },
      {
        new: true,
      }
    );
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
}
const resetPassword = async (req, res) => {
  try {
    let user = await User.find({ reset_password_token: req.body.token });
    if (user && user.length > 0) {
      if (req.body.password.length < 8)
        return res
          .status(400)
          .json({ message: "Password can't be shorter than 8 characters" });
      const hashedPwd = await bcrypt.hash(req.body.password, 10);
      // 10 salt rounds
      await User.updateOne(
        { _id: user[0]._id },
        { $set: { password: hashedPwd, confirm_password: hashedPwd } },
        {
          new: true,
        }
      );
      res.status(200).json({ message: "Password changed" });
    } else {
      throw "Please enter correct token";
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};

const handleVerifyOTP = async (req, res) => {
  const { otp, password } = req.body;

  const msg = { title: " ", body: " " };

  let preset = false;
  if (!otp) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Get key i.e. email or phone as key
  const userContactKey = Object.entries(req.userContact)[0][0];
  // Get values of previous key
  const userContactValue = Object.entries(req.userContact)[0][1];

  // Check if user exists

  const user = await User.findOne({ [userContactKey]: userContactValue });

  if (!user) return res.status(409).json({ message: "User isn't registered" });

  // Check whether OTP is same
  if (user.otp[`${userContactKey}OTP`] !== Number(otp))
    return res.status(409).json({ message: "OTP didn't match" });

  try {
    if (password) {
      preset = true;
      console.log("i am called");

      // Check password length
      if (password.length < 8)
        return res
          .status(400)
          .json({ message: "Password can't be shorter than 8 characters" });

      // Hash password
      const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

      // Set password
      user.password = hashedPwd;
    }

    // Change verification status to true and set OTP to null
    user.verification[`${userContactKey}Verified`] = true;
    user.otp[`${userContactKey}OTP`] = null;
    let role = user.role;
    // Save user
    await user.save();

    let emailmsg = { title: "", body: "" };
    let template_data, templateId;

    //send  Notifications
    if (preset) {
      let login_link = "";
      templateId = "";
      emailmsg = {
        title: `<strong> Password Changed! </strong>`,
        body:
          `<tr><td class="es-m-p25t es-m-p0b es-m-p0r es-m-p0l" style="Margin:0;padding-bottom:5px;padding-top:20px;padding-left:25px;padding-right:25px">` +
          `<h7 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey There! <br><br> The Password for your login account has been changed. Login now and enjoy our services. <br><br><br> If you any questions or queries, you can reach out to our support team at any time of the day. <br><br> Happy Cleaning! </h7></td></tr> ` +
          ` <tr><td style="padding:0;Margin:0"><form><button type="submit" formaction=${login_link} style="margin:10px 32%;width:15rem;border:none;background:none;border-radius:6px;padding:12px;text-align:center;background-color:#30E0A1;color:#FFFFFF"> Login Now </button></form></td></tr>`,
      };
      msg.title = "Password Changed!";
      msg.body =
        "Your Password has been recently changed!If it wasn't you, contact our support team now!";
    } else {
      let verify_link = "";

      emailmsg = {
        title: `<strong> Account Verified! </strong>`,
        body:
          `<tr><td class="es-m-p25t es-m-p0b es-m-p0r es-m-p0l" style="Margin:0;padding-bottom:5px;padding-top:20px;padding-left:25px;padding-right:25px">` +
          `<h7 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey There! <br><br>  Your Account has Been Verified! Login in to your account and enjoy our services. <br><br><br><br> If you any questions or queries, you can reach out to our support team at any time of the day. <br><br> Happy Cleaning! </h7></td></tr> ` +
          ` <tr><td style="padding:0;Margin:0"><form><button type="submit" formaction=${verify_link} style="margin:10px 32%;width:15rem;border:none;background:none;border-radius:6px;padding:12px;text-align:center;background-color:#30E0A1;color:#FFFFFF"> Verify Your Account </button></form></td></tr>`,
      };
      msg.title = "Account Verified!";
      msg.body = "Congrats,You are now an official Laundry Hero Member.";
    }
    let userDetail;
    if (user.email) {
      userDetail = user.email;
    } else {
      userDetail = user.phone;
    }

    const accessToken = getAccessToken(userDetail, user.role, user._id);
    const refreshToken = getRefreshToken(userDetail, user.role);

    // Set Refresh Token to http cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: nodeEnv !== "development",
      maxAge: 24 * 60 * 60 * 1000,
    });

    //send email to admin
    // let link = "https://laundryadmin.freshify.io/";
    let link = `https://laundryadmin.freshify.io/editProfile/${user._id}`;
    const admins = await User.find({ role: "ADMINISTRATOR" });
    template_data = await template.getTemplate({
      templateType: "NEW_USER_CREATED",
    });
    if (
      template_data &&
      template_data.length > 0 &&
      template_data[0].status == true
    ) {
      templateId = template_data[0].template_id;
      let admin_msg = {
        title: `New User has been registered.`,
        body: `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey Admin <br><br></br></br> A new user has been recently added to the Laundry Hero.Below are his details. <br></br><br></br>  UserId: ${
          user._id || "Not Specified Yet"
        }<br/>      Type:${role}<br/>      Link to Profile:${link}<br> <i>You can check more details in the admin dashboard.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Good Day!</h6>`,
      };

      let admindata = { email: "tech@laundryhero.co", link: link };

      sendEmailNotification(
        admindata,
        admin_msg,
        templateId,
        user.role,
        user.email
      );
      // admins.forEach((ind) => {
      //   //  console.log("ind.email",ind.email)
      //    delete ind.email;
      //    ind.email = process.env.ADMIN_EMAIL
      //   sendEmailNotification(ind, msg,templateId,user.role,user.email);
      // });
    }

    res.status(200).json({
      message: "OTP Verified Successfully",
      userContactKey: userContactValue,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("err", err);
    res.status(400).send(err);
  }
};

const handleVerifyToken = async (req, res) => {
  try {
    // Get auth header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // If no auth header found
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(400).json({ error: "Invalid Token format" });
    }

    // Extract access token from auth header
    const token = authHeader.split(" ")[1];

    // Verify extracted access token
    jwt.verify(token, accessTokenSecret, async (err, decoded) => {
      if (err?.name === "TokenExpiredError")
        return res.status(200).json({ expired: true });

      if (err) return res.status(400).json({ error: "Invalid Token format" });

      if (decoded) return res.status(200).send({ expired: false });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};
const loginWithSocialMedia = async (req, res) => {
  const { inviteId, referralCode } = req.body;
  try {
    //const userExists = await User.findOne({ email: req.body.email, socialMediaId: req.body.socialMediaId });
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      if (userExists.socialMediaId !== req.body.socialMediaId) {
        res.status(400).send({
          message:
            "This user is already registered! Please sign in using your email and password",
        });
      } else {
        const userContact = userExists.email;
        const userRole = userExists.role;
        const userId = userExists._id;

        // Create access and refresh tokens
        const accessToken = getAccessToken(userContact, userRole, userId);
        const refreshToken = getRefreshToken(userContact, userRole);

        // Set Refresh Token to http cookie
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: nodeEnv !== "development",
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ accessToken, refreshToken });
      }
    } else {
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        email: req.body.email,
        socialMediaId: req.body.socialMediaId,
        socialMediaType: req.body.socialMediaType,
        role: req.body.role,
        status: "ACTIVE",
        verification: {
          emailVerified: true,
          phoneVerified: false,
        },
        notification: {
          app: true,
          email: true,
          sms: true,
        },
      });

      const savedUser = await user.save();

      if (inviteId) {
        const data = await BusinessAccount.find({ inviteId: inviteId });

        if (data.length === 0) {
          await User.findByIdAndDelete(savedUser._id);
          return res.status(400).json({ error: "Your Invite Id is incorrect" });
        }
        await BusinessAccount.updateOne(
          { inviteId: data[0]?.inviteId },
          {
            $push: {
              members: {
                Id: savedUser._id,
              },
            },
          }
        );
        let bussinessAccountData = {
          manageOrder: true,
          managePayment: true,
          maxBags: "10",
          bussinessId: data[0]._id,
        };

        user.businessAccount = bussinessAccountData;

        await user.save();
      }

      if (referralCode) {
        const data = await User.find({ referralCode: referralCode });
        if (data) {
          await User.updateOne(
            { _id: data[0]._id },
            {
              $push: {
                referredTo: {
                  userId: savedUser._id,
                  email: savedUser.email,
                  referralCode,
                  referralDateAndTime: Date.now(),
                  status: "JOINED",
                  activationDateAndTime: Date.now(),
                },
              },
            }
          );
        }
      }
      if (savedUser.role === "LAUNDRY_HERO") {
        // Save the id of hero in Hero model
        const hero = new Hero({
          userId: savedUser?._id.toHexString(),
          verified: false,
          heroStatus: "NONE",
          email: savedUser?.email,
          availability: [
            {
              day: "Monday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Tuesday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Wednesday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Thursday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Friday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Saturday",
              from: "800",
              to: "2300",
              bags: 1,
            },
            {
              day: "Sunday",
              from: "800",
              to: "2300",
              bags: 1,
            },
          ],
        });
        await hero.save();
      }
      const userContact = savedUser.email;
      const userRole = savedUser.role;
      const userId = savedUser._id;

      // admin notifications send
      let link;
      let msg = {
        title: `New User has been registered.`,
        body: `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center"> Hey Admin <br><br></br></br> A new user has been recently added to the Laundry Hero.Below are his details. <br></br><br></br>  UserId: ${
          savedUser._id || "Not Specified Yet"
        }<br/>      Type:${
          savedUser.role
        }<br/>      Link to Profile:${link}<br> <i>You can check more details in the admin dashboard.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Good Day!</h6>`,
      };

      const admins = await User.find({ role: "ADMINISTRATOR" });
      admins.forEach((ind) => {
        sendEmailNotification(ind, msg);
      });

      // Create access and refresh tokens
      const accessToken = getAccessToken(userContact, userRole, userId);
      const refreshToken = getRefreshToken(userContact, userRole);

      // Set Refresh Token to http cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: nodeEnv !== "development",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ accessToken, refreshToken });
    }
  } catch (err) {
    console.log(err.message);
    err ? res.status(500).send({ message: err }) : res.sendStatus(400);
  }
};
const checkUserExistence = async (req, res) => {
  try {
    let email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Email is Required!" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res
        .status(200)
        .send({ message: "This user is already registered", Registerd: true });
    } else {
      res
        .status(200)
        .send({ message: "This user is not registered", Registerd: false });
    }
  } catch (err) {
    console.log(err.message);
    err ? res.status(500).send({ message: err }) : res.sendStatus(400);
  }
};

module.exports = {
  handleRegister,
  checkUserExistence,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleSendOTP,
  handleVerifyOTP,
  handleVerifyToken,
  loginWithSocialMedia,
  forgotPassword,
  resetPassword,
};
