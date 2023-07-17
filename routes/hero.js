const router = require("express").Router();

const {
  getAllHeroes,
  getHeroById,
  updateHero,
  updateHeroAdmin,
  applyHero,
  createConnectAccounts,
  availabilityStatus,
  verifyStripeToken,
} = require("../controllers/handleHeroes");

router.get("/getAllHeroes", getAllHeroes);
router.get("/get/:id?", getHeroById);
router.put("/updateHero/:id?", updateHero);
router.put("/updateHeroAdmin/:id?", updateHeroAdmin);
router.post("/create-connect-account", createConnectAccounts);
router.post("/availability/:status", availabilityStatus);
router.put("/applyHero", applyHero);
router.post("/verifyStripeToken", verifyStripeToken);
module.exports = router;
