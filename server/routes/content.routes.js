const express = require("express");
const ContentController = require("../controllers/content.controller");

const router = express.Router();

router.get("/contents", ContentController.getAll);
router.post("/contents", ContentController.create);
router.delete("/contents/:id", ContentController.delete);
router.put("/contents", ContentController.updateRevisao);
router.patch("/contents/:id", ContentController.updateContent);

module.exports = router;
