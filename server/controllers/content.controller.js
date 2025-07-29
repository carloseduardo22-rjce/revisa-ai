const ContentModel = require("../models/content.model");
require("dotenv").config();

class ContentController {
  static _calculateNextReviewDate(row, createdDate) {
    const baseDate = row
      ? new Date(row.data_ultima_revisao)
      : new Date(row.created_at);
    let reviewDate;

    switch (row.ultima_revisao) {
      case 1:
        reviewDate = new Date(createdDate);
        reviewDate.setDate(createdDate.getDate() + 7);
        break;
      case 2:
        reviewDate = new Date(baseDate);
        reviewDate.setDate(baseDate.getDate() + 7);
        break;
      case 3:
        reviewDate = new Date(baseDate);
        reviewDate.setDate(baseDate.getDate() + 14);
        break;
      default:
        reviewDate = null;
    }

    return reviewDate;
  }

  static _processContentRow(row) {
    const createdDate = new Date(row.created_at);

    if (!(createdDate instanceof Date) || isNaN(createdDate.getTime())) {
      return {
        ...row,
        nextReview: null,
        created_at: "Invalid date",
      };
    }

    const nextReviewDate = ContentController._calculateNextReviewDate(
      row,
      createdDate
    );

    return {
      ...row,
      nextReview: nextReviewDate
        ? nextReviewDate.toISOString().split("T")[0]
        : null,
      created_at: createdDate.toISOString().split("T")[0],
    };
  }

  static async getAll(req, res) {
    ContentModel.getAll((err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      try {
        const result = rows.map((row) => {
          return ContentController._processContentRow(row);
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: "Erro ao processar dados de conteúdo",
          details: error.message,
        });
      }
    });
  }

  static _createContentResponse(id, title, link, createdAt) {
    return {
      id: id,
      title: title,
      link: link,
      created_at: createdAt,
    };
  }

  static async create(req, res) {
    const { titulo, title, link } = req.body;
    const finalTitle = title || titulo;

    if (!finalTitle || !link) {
      return res.status(400).json({ error: "Título e link são obrigatórios." });
    }

    const createdAt = new Date().toISOString();
    let summary = "";

    try {
      ContentModel.create(finalTitle, link, createdAt, summary, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const response = ContentController._createContentResponse(
          this.lastID,
          finalTitle,
          link,
          createdAt
        );
        res.status(201).json(response);
      });
    } catch (error) {
      res.status(500).json({
        error: "Erro ao gerar resumo",
        title: title,
        link: link,
        created_at: createdAt,
        summary: summary,
      });
    }
  }

  static delete(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID inválido.", id: id });
    }

    ContentModel.delete(id, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }

  static _getNextReviewMessage(reviewLevel) {
    const nextReviewMessages = {
      2: "7 dias",
      3: "14 dias",
      4: "Concluído",
    };

    return nextReviewMessages[reviewLevel] || "Concluído";
  }

  static _getContentById(id, callback) {
    ContentModel.getById(id, (err, row) => {
      if (err) {
        return callback({ status: 500, error: err.message });
      }

      if (!row) {
        return callback({ status: 404, error: "Conteúdo não encontrado." });
      }

      callback(null, row);
    });
  }

  static _updateReviewInDatabase(id, newLevel, currentDate, callback) {
    ContentModel.updateRevisao(id, newLevel, currentDate, (err) => {
      if (err) {
        return callback({ status: 500, error: err.message });
      }

      const nextReviewMessage =
        ContentController._getNextReviewMessage(newLevel);

      callback(null, {
        success: true,
        message: "Revisão feita com sucesso.",
        id: id,
        last_review: newLevel,
        next_review: nextReviewMessage,
      });
    });
  }

  static updateRevisao(req, res) {
    const content = req.body;

    if (!content.id) {
      return res.status(400).json({ error: "ID inválido.", id: content.id });
    }

    ContentController._getContentById(content.id, (err, content) => {
      if (err) {
        return res.status(err.status).json({ error: err.error });
      }

      if (content.ultima_revisao >= 4) {
        return res.status(400).json({
          error: "Todas as revisões foram feitas.",
          last_review: content.ultima_revisao,
        });
      }

      const newReviewLevel = content.ultima_revisao + 1;
      const currentDate = new Date().toISOString();

      ContentController._updateReviewInDatabase(
        content.id,
        newReviewLevel,
        currentDate,
        (err, result) => {
          if (err) {
            return res.status(err.status).json({ error: err.error });
          }

          res.status(200).json(result);
        }
      );
    });
  }

  static updateContent(req, res) {
    const { id } = req.params;
    const { titulo, title, link } = req.body;
    const finalTitle = title || titulo;

    if (!finalTitle || !link) {
      return res.status(400).json({
        error: "Título e link são obrigatórios",
      });
    }

    ContentModel.updateContent(id, finalTitle, link, (err, result) => {
      if (err) {
        return res.status(err.status).json({ error: err.error });
      }

      res.status(200).json(result);
    });
  }
}

module.exports = ContentController;
