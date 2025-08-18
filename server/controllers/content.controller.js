const ContentService = require("../services/content.service");

class ContentController {
  static async getAll(req, res) {
    try {
      const result = await ContentService.getAllContent();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao buscar conteúdos",
        details: error.message,
      });
    }
  }

  static async getQuestionsLink(req, res) {
    try {
      const { link } = req.params;

      if (!link) {
        return res.status(400).json({ error: "Link é obrigatório." });
      }

      const questions = await ContentService.generateQuestionsFromLink(link);
      res.json(questions);
    } catch (error) {
      console.error("Erro ao gerar perguntas e respostas:", error);
      res.status(500).json({ error: "Erro ao gerar perguntas e respostas" });
    }
  }

  static async create(req, res) {
    const { titulo, title, link } = req.body;
    const finalTitle = title || titulo;

    if (!finalTitle || !link) {
      return res.status(400).json({ error: "Título e link são obrigatórios." });
    }

    try {
      const response = await ContentService.createContent(finalTitle, link);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao criar conteúdo",
        details: error.message,
      });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID inválido.", id: id });
    }

    try {
      const result = await ContentService.deleteContent(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateRevisao(req, res) {
    const content = req.body;

    if (!content.id) {
      return res.status(400).json({ error: "ID inválido.", id: content.id });
    }

    try {
      const result = await ContentService.updateContentReview(content.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message,
        ...(error.last_review && { last_review: error.last_review }),
      });
    }
  }

  static async updateContent(req, res) {
    const { id } = req.params;
    const { titulo, title, link } = req.body;
    const finalTitle = title || titulo;

    if (!finalTitle || !link) {
      return res.status(400).json({
        error: "Título e link são obrigatórios",
      });
    }

    try {
      const result = await ContentService.updateContent(id, finalTitle, link);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = ContentController;
