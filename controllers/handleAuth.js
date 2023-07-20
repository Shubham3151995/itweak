const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { getAccessToken, getRefreshToken } = require("../utils/createJWT");
const { nodeEnv, refreshTokenSecret } = require("../config/appConfig");
const { accessTokenSecret } = require("../config/appConfig");
const Subscription = require("../models/Subscription");
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const { createCustomer } = require("../services/stripe");
const {
  sendEmailNotification,
} = require("../utils/sendNotifications");

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
    let newCutomer = await createCustomer({
      name: req.body.name,
      email: req.body.email
    });
    user.stripeCustomerId = newCutomer.id
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

const forgotPassword = async (req, res) => {
  try {
    let user = await User.find({ email: req.body.email });
    if (user && user.length > 0) {
      const otp = Math.floor(10000000 + Math.random() * 90000000);
      await updateResetPasswordToken(user[0]._id, otp);
      const subject = "Reset Password";
      const htmlBody = `Your reset password otp is ${otp}`
      await sendEmailNotification(user[0].email, htmlBody, subject);
      res
        .status(200)
        .json({ message: "Reset password otp sent to your email" });
    } else {
      throw "Please enter correct email";
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};
async function updateResetPasswordToken(userId, otp) {
  try {
    await User.updateOne(
      { _id: userId },
      { $set: { reset_password_otp: otp } },
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
    let user = await User.find({ reset_password_otp: req.body.otp });
    if (user && user.length > 0) {
      if (req.body.password.length < 8)
        return res
          .status(400)
          .json({ message: "Password can't be shorter than 8 characters" });
      if (req.body.password !== req.body.confirm_password)
        return res
          .status(400)
          .json({ message: "Confirm password should be same as password" });

      const hashedPwd = await bcrypt.hash(req.body.password, 10);
      const confirm_hashedPwd = await bcrypt.hash(req.body.confirm_password, 10);

      // 10 salt rounds
      await User.updateOne(
        { _id: user[0]._id },
        { $set: { password: hashedPwd, confirm_password: confirm_hashedPwd } },
        {
          new: true,
        }
      );
      res.status(200).json({ message: "Password changed" });
    } else {
      res.status(400).json({ message: "Please enter correct otp" });
    }
  } catch (err) {
    res.status(500).send({ error: "Something went wrong" });
    console.log(err);
  }
};


module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  forgotPassword,
  resetPassword,
};
