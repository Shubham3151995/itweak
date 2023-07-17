const express = require("express");
const router = express.Router();
//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  getAllPromoCode,
  createPromoCode,
  editPromoCode,
  deletePromoCode,
  getNewUserPromoCode,
  promocodedisscount,
  promoUsedCountUpdate,
} = require("../controllers/promoCode");

router.post("/create", createPromoCode);
router.post("/promoCount/:name", promoUsedCountUpdate);

router.put("/update/:id", editPromoCode);
router.get("/getall", getAllPromoCode);
router.get("/get-one", getNewUserPromoCode);
router.get("/procodedisscount/:code", promocodedisscount);
router.delete("/delete/:id", deletePromoCode);

module.exports = router;
