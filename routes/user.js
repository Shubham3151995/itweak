const router = require("express").Router();
const verifyIdParam = require("../middlewares/verifyIdParam");
const emailPhoneCheck = require("../middlewares/emailPhoneCheck");
//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateContact,
  deleteUser,
  getUsersList,
  getNotification,
  updateNotification,
  getTerritoryStatus,
  handleRole,
  favoriteHerosAdd,
  favoriteHerosDelete,
  favoriteHerosList,
  deleteAddress,
  getAllTemplates,
  defaultCardStatus,
  getAgoraToken,
} = require("../controllers/handleUsers");
const { generateUploadUrl } = require("../services/S32");

router.get("/getAllUsers", getAllUsers);
router.get("/getUsersList", getUsersList);
router.get("/get/:id?", verifyIdParam, getUserById);
router.put("/updateUser/:id?", verifyIdParam, updateUser);
router.put("/updateContact", updateContact);
router.delete("/deleteUser/:id", deleteUser);
// router.put("/defaultCardStatus/:cardId", defaultCardStatus);
// router.delete("/deleteAddress/:id", deleteAddress);
// router.put("/role/:id", handleRole);
// router.post("/territoryStatus/:name", getTerritoryStatus);
// router.post("/favoriteHeros/:id", favoriteHerosAdd);
// router.post("/favoriteHerosDelete/:id", favoriteHerosDelete);
// router.get("/consumersFavoriteHeros", favoriteHerosList);
// router.get("/getAllTemplates", getAllTemplates);
// router.post("/agoraToken", getAgoraToken);

module.exports = router;
