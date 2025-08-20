const ContentService = require("../services/content.service");

class FeedbackController {
  static async getFeedback(req, res) {
    const { questionsAndAnswers } = req.body;

    try {
      const feedback = await ContentService.getFeedback(questionsAndAnswers);
      res.json(feedback);
    } catch (error) {
      console.error("Erro ao obter feedback:", error);
      res.status(500).json({ error: "Erro ao obter feedback" });
    }
  }
}

module.exports = FeedbackController;
