const express = require("express");
const multer = require("multer");

const ContentController = require("../controllers/content.controller");
const FeedbackController = require("../controllers/feedback.controller");

const router = express.Router();

router.get("/contents", ContentController.getAll);
router.get("/questions/:link", ContentController.getQuestionsLink);
router.post("/contents", ContentController.create);
router.post("/feedback", FeedbackController.getFeedback);
router.delete("/contents/:id", ContentController.delete);
router.put("/contents", ContentController.updateRevisao);
router.patch("/contents/:id", ContentController.updateContent);

module.exports = router;
