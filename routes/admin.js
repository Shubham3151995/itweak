const router = require("express").Router();

const {
  addUser,
  addTerritory,
  editTerritory,
  getAllTerritory,
  deleteTerritory,
  addContent,
  updateContent,
  deleteContent,
  getAllContent,
  updateNotifier,
  addNotifier,
  getAllNotifier,
  getSlider,
  dragDropSlider,
} = require("../controllers/handleAdmin");

//Admin routes
router.post("/addUser", addUser);
// Territories
router.post("/addTerritory", addTerritory);
router.put("/editTerritory/:id?", editTerritory);
router.get("/allTerritories", getAllTerritory);
router.delete("/deleteTerritory/:id?", deleteTerritory);

// Content

router.post("/addContent", addContent);
router.put("/editContent/:id?", updateContent);
router.delete("/deleteContent/:id?", deleteContent);
router.get("/allContent", getAllContent);
router.get("/getSlider", getSlider);
router.post("/dragDropSlider/:id", dragDropSlider);

// Notifiers
router.post("/addNotifier", addNotifier);
router.put("/editNotifier/:id?", updateNotifier);
router.get("/allNotifier", getAllNotifier);

module.exports = router;
