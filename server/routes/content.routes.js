const express = require("express");
const multer = require("multer");

const ContentController = require("../controllers/content.controller");
const CardController = require("../controllers/card.controller");

const router = express.Router();

router.get("/contents", ContentController.getAll);
router.get("/questions/:link", ContentController.getQuestionsLink);
router.post("/contents", ContentController.create);
router.delete("/contents/:id", ContentController.delete);
router.put("/contents", ContentController.updateRevisao);
router.patch("/contents/:id", ContentController.updateContent);
router.post(
  "/cards/transcribe-audio",
  multer().single("audio"),
  CardController.transcribeAudio
);

module.exports = router;
