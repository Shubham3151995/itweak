const express = require("express");
const router = express.Router();
const {
  getAllSendgridTemplates,
  saveTemplate,
  templateListingByAdmin
} = require("../controllers/handleTemplates");

router.get("/getAllSendgridTemplates", getAllSendgridTemplates);
router.post("/saveTemplate", saveTemplate);
router.get("/templateListingByAdmin", templateListingByAdmin);


module.exports = router;
