const router = require("express").Router();

const {
  createBusinessAccountOwner,
  updatetBusinessAccount,
  getBusinessAccountById,
  deleteBusinessAccount,
  removeMember,
  getAllBussiness,
  setPermissions,
  addMember,
  getBusinessMember,
  getBusinessInfo,
} = require("../controllers/handleBusinessAccount");

router.post("/create", createBusinessAccountOwner);
router.put("/update/:id", updatetBusinessAccount);
//router.put("/updateSubscription/:id", updatetBusinessAccountSubscription);
router.get("/get/:id", getBusinessAccountById);
router.get("/getall", getAllBussiness);
router.delete("/delete/:id", deleteBusinessAccount);
router.put("/remove/:id", removeMember);
router.put("/accountpermissions/:id", setPermissions);
router.post("/addMember", addMember);
router.get("/getMember/:id", getBusinessMember);
//router.post("/member", createBusinessAccountReferByOwner);
router.get("/getBusinessInfo/:businessId", getBusinessInfo);

module.exports = router;
