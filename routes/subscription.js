const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");

//const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  getAllSubscription,
  createSubscription,
  editSubscription,
  deleteSubscription,
  buySubscription,
  subscriptiondetail
} = require("../controllers/subscription");

router.post("/create", createSubscription);
router.put("/update/:id", editSubscription);
router.get("/getall", getAllSubscription);
router.delete("/delete/:id", deleteSubscription);
router.put("/buySubscription", verifyJWT, buySubscription);
router.get("/subscriptiondetail/:id", subscriptiondetail);

module.exports = router;
