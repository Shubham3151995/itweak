const router = require("express").Router();
const {
  createCustomerAccount,
  getCustomerAccount,
  updateCustomerAccount,
  publicKey,
  addCard,
  deleteCard,
} = require("../controllers/handleTransaction");

router
  .route("/customerAccount/:id?")
  .post(createCustomerAccount)
  .get(getCustomerAccount)
  .put(updateCustomerAccount);

router.get("/publicKey", publicKey);
router.post("/addCard", addCard);
router.delete("/deleteCard", deleteCard);
module.exports = router;
