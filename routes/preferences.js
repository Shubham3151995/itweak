const router = require("express").Router();
const verifyIdParam = require("../middlewares/verifyIdParam");

const {
  addPreferenceField,
  editPreferenceField,
  deletePreferenceField,
  getAllPreferencesField,
  addUserPreference,
  getUserPreference,
  updateUserPreference,
  deleteUserPreference,
} = require("../controllers/handlePreferences");

// Add/edit/delete new preference filed (only admin can access)
router.post("/addPreferenceField", addPreferenceField);
router.put("/editPreferenceField/:id", verifyIdParam, editPreferenceField);
router.delete("/deletePreferenceField/:id", deletePreferenceField);
router.get("/getAllPreferencesField", getAllPreferencesField);

// Admin and user access
router.post("/addUserPreference", addUserPreference);
router.get("/getUserPreference/:id?", verifyIdParam, getUserPreference);
router.put("/updateUserPreference/:id?", verifyIdParam, updateUserPreference);
router.delete(
  "/deleteUserPreference/:id?",
  verifyIdParam,
  deleteUserPreference
);

module.exports = router;
