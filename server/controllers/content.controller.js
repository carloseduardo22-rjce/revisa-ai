const ContentModel = require("../models/content.model");
require("dotenv").config();

class ContentController {
  static async getAll(req, res) {
    ContentModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const result = rows.map((row) => {
        const created = new Date(row.created_at);

        if (isNaN(created.getTime())) {
          return {
            ...row,
            proximaRevisao: null,
            created_at: "Data inválida",
          };
        }

        let revisao;
        let dataBase;

        if (row.data_ultima_revisao) {
          dataBase = new Date(row.data_ultima_revisao);
        } else {
          dataBase = created;
        }

        if (row.ultima_revisao === 1) {
          revisao = new Date(created);
          revisao.setDate(created.getDate() + 7);
        } else if (row.ultima_revisao === 2) {
          revisao = new Date(dataBase);
          revisao.setDate(dataBase.getDate() + 7);
        } else if (row.ultima_revisao === 3) {
          revisao = new Date(dataBase);
          revisao.setDate(dataBase.getDate() + 14);
        } else {
          revisao = null;
        }

        return {
          ...row,
          proximaRevisao: revisao ? revisao.toISOString().split("T")[0] : null,
          created_at: created.toISOString().split("T")[0],
        };
      });
      res.json(result);
    });
  }

  static async create(req, res) {
    const { titulo, link } = req.body;
    if (!titulo || !link) {
      return res.status(400).json({ error: "Título e link são obrigatórios." });
    }

    const created_at = new Date().toISOString();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.google_ai_key}`,
        {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Acesse este link: ${link} e faça um resumo do conteúdo do link adicionando a sua explicação. Forme um resumo completo e rico. E também tópicos de quando usar.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const resumo = result.candidates[0].content.parts[0].text;

      ContentModel.create(titulo, link, created_at, resumo, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, titulo, link, created_at });
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao gerar resumo" });
    }
  }

  static delete(req, res) {
    const { id } = req.params;
    ContentModel.delete(id, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }

  static updateRevisao(req, res) {
    const { id } = req.params;

    if (id === "undefined" || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido", id: id });
    }

    ContentModel.getById(id, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row)
        return res.status(404).json({ error: "Conteúdo não encontrado" });

      if (row.ultima_revisao >= 4) {
        return res.status(400).json({
          error: "Todas as revisões já foram concluídas",
          ultima_revisao: row.ultima_revisao,
        });
      }

      const novoNivelRevisao = row.ultima_revisao + 1;
      const dataAtual = new Date().toISOString();

      ContentModel.updateRevisao(
        id,
        novoNivelRevisao,
        dataAtual,
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          const proximasRevisoes = {
            2: "7 dias",
            3: "14 dias",
            4: "Concluído",
          };

          res.status(200).json({
            success: true,
            message: "Revisão atualizada com sucesso",
            id: id,
            ultima_revisao: novoNivelRevisao,
            proxima_revisao: proximasRevisoes[novoNivelRevisao] || "Concluído",
          });
        }
      );
    });
  }
}

module.exports = ContentController;
