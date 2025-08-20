const ContentModel = require("../models/content.model");

class ContentService {
  static calculateNextReviewDate(row, createdDate) {
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

  static async getFeedback(questionsAndAnswers) {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Olá Gemini, aqui está um array de objetos que seria as perguntas e respostas geradas por você somada a resposta do usuário do meu sistema. 
              Agora eu quero que você me retorne um objeto dizendo se o usuário acertou ou não para cada resposta dele. Vamos combinar que, se a resposta dele teve 70% de semalhança com a resposta certa ele acertou ok? 
              Ai você retorna sim mais a porcentagem certo? Faça da melhor forma. Aqui está o array: 
              ${questionsAndAnswers}
              `,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.google_ai_key,
        },
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  }

  static processContentRow(row) {
    const createdDate = new Date(row.created_at);

    if (!(createdDate instanceof Date) || isNaN(createdDate.getTime())) {
      return {
        ...row,
        nextReview: null,
        created_at: "Invalid date",
      };
    }

    const nextReviewDate = ContentService.calculateNextReviewDate(
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

  static async getAllContent() {
    return new Promise((resolve, reject) => {
      ContentModel.getAll((err, rows) => {
        if (err) {
          return reject(new Error(err.message));
        }

        try {
          const result = rows.map((row) => {
            return ContentService.processContentRow(row);
          });
          resolve(result);
        } catch (error) {
          reject(
            new Error("Erro ao processar dados de conteúdo: " + error.message)
          );
        }
      });
    });
  }

  static createContentResponse(id, title, link, createdAt) {
    return {
      id: id,
      title: title,
      link: link,
      created_at: createdAt,
    };
  }

  static async generateQuestionsFromLink(link) {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Acesse este link: ${link} e gere perguntas e respostas sobre o conteúdo. Quero que você organize as perguntas e respostas separados no padrão "Pergunta: resposta". Não inclua nenhuma outra informação, apenas as perguntas e respostas.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.google_ai_key,
        },
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  }

  static async createContent(title, link) {
    const createdAt = new Date().toISOString();
    let summary = "";

    return new Promise((resolve, reject) => {
      ContentModel.create(title, link, createdAt, summary, function (err) {
        if (err) {
          return reject(new Error(err.message));
        }

        const response = ContentService.createContentResponse(
          this.lastID,
          title,
          link,
          createdAt
        );
        resolve(response);
      });
    });
  }

  static async deleteContent(id) {
    return new Promise((resolve, reject) => {
      ContentModel.delete(id, function (err) {
        if (err) {
          return reject(new Error(err.message));
        }
        resolve({ success: true });
      });
    });
  }

  static getNextReviewMessage(reviewLevel) {
    const nextReviewMessages = {
      2: "7 dias",
      3: "14 dias",
      4: "Concluído",
    };

    return nextReviewMessages[reviewLevel] || "Concluído";
  }

  static async getContentById(id) {
    return new Promise((resolve, reject) => {
      ContentModel.getById(id, (err, row) => {
        if (err) {
          return reject({ status: 500, message: err.message });
        }

        if (!row) {
          return reject({ status: 404, message: "Conteúdo não encontrado." });
        }

        resolve(row);
      });
    });
  }

  static async updateReviewInDatabase(id, newLevel, currentDate) {
    return new Promise((resolve, reject) => {
      ContentModel.updateRevisao(id, newLevel, currentDate, (err) => {
        if (err) {
          return reject({ status: 500, message: err.message });
        }

        const nextReviewMessage = ContentService.getNextReviewMessage(newLevel);

        resolve({
          success: true,
          message: "Revisão feita com sucesso.",
          id: id,
          last_review: newLevel,
          next_review: nextReviewMessage,
        });
      });
    });
  }

  static async updateContentReview(contentId) {
    try {
      const content = await ContentService.getContentById(contentId);

      if (content.ultima_revisao >= 4) {
        throw {
          status: 400,
          message: "Todas as revisões foram feitas.",
          last_review: content.ultima_revisao,
        };
      }

      const newReviewLevel = content.ultima_revisao + 1;
      const currentDate = new Date().toISOString();

      return await ContentService.updateReviewInDatabase(
        content.id,
        newReviewLevel,
        currentDate
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateContent(id, title, link) {
    return new Promise((resolve, reject) => {
      ContentModel.updateContent(id, title, link, (err, result) => {
        if (err) {
          return reject({
            status: err.status || 500,
            message: err.error || err.message,
          });
        }
        resolve(result);
      });
    });
  }
}

module.exports = ContentService;
