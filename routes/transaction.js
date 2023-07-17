const router = require("express").Router();
const verifyIdParam = require("../middlewares/verifyIdParam");

const {
  createCustomerAccount,
  getCustomerAccount,
  updateCustomerAccount,
  createHeroBankAccount,
  pay,
  payout,
  getPayments,
  getPayouts,
  publicKey,
  addCard,
  getHeroPayout,
  getCustomerPayments,
  getHeroBankAccounts,
  addDebitCard,
  updateHeroStripeAccount,
  getPayoutDetail,
  deleteCard,
  deleteHeroCard,
  deleteBusinessCard,
  getTotalPayment,
  getPayoutDeatail,
} = require("../controllers/handleTransaction");

router
  .route("/customerAccount/:id?")
  .post(createCustomerAccount)
  .get(getCustomerAccount)
  .put(updateCustomerAccount);
// .delete(deleteCustomerAccount);

router.get("/publicKey", publicKey);
router.post("/addCard", addCard);
router.delete("/deleteCard", deleteCard);
router.delete("/deleteHeroCard/:card_id", deleteHeroCard);
router.post("/deleteBusinessCard/:businessId/:card_id", deleteBusinessCard);
router.post("/pay", pay);
router.post("/payout", payout);

router.post("/hero-bank-account/:id?", createHeroBankAccount);
router.post("/hero-add-card/:id?", addDebitCard);
router.put("/update-account/:id?", updateHeroStripeAccount);
router.get("/hero-bank-account/:userid?", getHeroBankAccounts);

router.get("/getPayments", getPayments);
router.get("/getPayouts", getPayouts);
router.get("/getPayoutDetail/:id?", getPayoutDetail);

router.get("/get/cutomer/payments", getCustomerPayments);
router.get("/get/hero/payout", getHeroPayout);
router.get("/totalPayment", getTotalPayment);
router.get("/getPayoutDeatail", getPayoutDeatail);
module.exports = router;
