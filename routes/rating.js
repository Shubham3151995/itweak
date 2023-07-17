const router = require("express").Router();
const {
  getRating,
  addRating,
  updateRating,
  deleteRating,
  getAllRatings,
} = require("../controllers/handleRatings");

router
  .route("/:id")
  .get(getRating)
  .post(addRating)
  .put(updateRating)
  .delete(deleteRating);

router.get("/", getAllRatings);

module.exports = router;
