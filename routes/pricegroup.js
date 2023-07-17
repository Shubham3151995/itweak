const express = require("express");
const router = express.Router();
//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  getAllPriceGroup,
  createPriceGroup,
  editPriceGroup,
  deletePriceGroup,
} = require("../controllers/priceGroup");

router.post("/create", createPriceGroup);
router.put("/update/:id", editPriceGroup);
router.get("/getall", getAllPriceGroup);
router.delete("/delete/:id", deletePriceGroup);

module.exports = router;
