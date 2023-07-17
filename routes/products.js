const express = require("express");
const router = express.Router();
//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  addProduct,
  getProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  productListing
} = require("../controllers/handleProducts");

router.post("/add", addProduct);
router.get("/get", getProduct);
router.get("/productListing", productListing);
router.get("/get/:id", getProductById);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;
