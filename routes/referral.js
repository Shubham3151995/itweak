const router = require("express").Router();
const { addReferral, checkRating } = require("../controllers/handleReferrals");

router.get("/", addReferral);
router.post("/rate", checkRating);

module.exports = router;
