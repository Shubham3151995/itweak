const router = require("express").Router();
const verifyIdParam = require("../middlewares/verifyIdParam");
const emailPhoneCheck = require("../middlewares/emailPhoneCheck");
//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  getUserById,
  updateUser,
  deleteUser,
  deleteAddress,
} = require("../controllers/handleUsers");
const { generateUploadUrl } = require("../services/S32");

router.get("/get/:id?", verifyIdParam, getUserById);
router.put("/updateUser/:id?", verifyIdParam, updateUser);
router.delete("/deleteUser/:id", deleteUser);
// router.delete("/deleteAddress/:id", deleteAddress);
module.exports = router;
