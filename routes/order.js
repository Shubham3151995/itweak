const express = require("express");
const router = express.Router();
const verifyIdParam = require("../middlewares/verifyIdParam");
const {
  createOrder,
  updateOrder,
  updateMultplOrder,
  getOrder,
  getAllOrders,
  getOrderHistory,
  repeatOrder,
  updateOrderStatus,
  getPriceGroupDiscount,
  getPricePerBag,
  checkAddress,
  assignHero,
  exportUnpaidOrders,
} = require("../controllers/handleOrders");

router.post("/createOrder/:id?", createOrder);
router.put("/updateOrder/:id?", verifyIdParam, updateOrder);
router.put("/updateOrderStatus/:id?", verifyIdParam, updateOrderStatus);
router.put("/updateMultplOrder", updateMultplOrder);
router.get("/getOrder/:id?", verifyIdParam, getOrder);
router.get("/checkAddress/:id?", checkAddress);
router.get("/repeatOrder/:id?", repeatOrder);
// Get order history (User id is required for admin)
router.get("/getOrderHistory/:id?", verifyIdParam, getOrderHistory);
router.post("/getPriceGroupDiscount", getPriceGroupDiscount);
router.get("/getPricePerBag/:bags", getPricePerBag);
// Only admin can access
router.get("/getAllOrders", getAllOrders);
router.post("/assignHero/:orderId/:heroId", assignHero);
router.get("/exportUnpaidOrders/:businessId", exportUnpaidOrders);
module.exports = router;
