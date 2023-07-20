const express = require("express");
const router = express.Router();
const emailPhoneCheck = require("../middlewares/emailPhoneCheck");
const {
  handleRegister,
  handleLogin,
  handleLogout,
  forgotPassword,
  resetPassword,
} = require("../controllers/handleAuth");
const verifyJWT = require("../middlewares/verifyJWT");


const { uploadFile, getFile, deleteFile } = require("../controllers/handleImage");

router.post("/register", emailPhoneCheck, handleRegister);
router.post("/login", emailPhoneCheck, handleLogin);
//  router.post("/loginWithToken", handleLoginWithToken);
router.get("/logout", handleLogout);
// Resend/Send OTP
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);


// upload image
router.post("/uploadimage", verifyJWT, uploadFile);
//get image
router.get("/getFile/:id", verifyJWT, getFile);
//delete file
router.delete("/deleteFile/:id", verifyJWT, deleteFile);

module.exports = router;
