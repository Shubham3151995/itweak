const express = require("express");
const router = express.Router();
const emailPhoneCheck = require("../middlewares/emailPhoneCheck");
const {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleSendOTP,
  handleVerifyOTP,
  handleVerifyToken,
  loginWithSocialMedia,
  checkUserExistence,
  forgotPassword,
  resetPassword,
} = require("../controllers/handleAuth");

const authValidation = require("../validations/AuthValidation");

const { uploadFile } = require("../controllers/handleImage");
const { getContentPages } = require("../controllers/handleUsers");

router.post("/register", emailPhoneCheck, handleRegister);
router.post("/login", emailPhoneCheck, handleLogin);
//  router.post("/loginWithToken", handleLoginWithToken);
router.get("/logout", handleLogout);
router.post("/refresh", handleRefreshToken);
// Resend/Send OTP
// router.post("/send-otp", emailPhoneCheck, handleSendOTP);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

// Verify OTP
router.post("/verify-otp", emailPhoneCheck, handleVerifyOTP);

// Verify Token
router.get("/verify-token", handleVerifyToken);
// upload image
router.post("/uploadimage", uploadFile);
//Get Content Pages
router.get("/pagecontent", getContentPages);
router.get("/checkUserExistence", checkUserExistence);
router.post(
  "/login-with-social-media",
  authValidation.loginWithSocialMediaValidation,
  loginWithSocialMedia
);

module.exports = router;
