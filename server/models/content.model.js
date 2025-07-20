const db = require("../database/db");

class ContentModel {
  static getAll(callback) {
    db.all("SELECT * FROM contents ORDER BY id DESC", [], callback);
  }

  static create(titulo, link, created_at, resume_ai, callback) {
    db.run(
      "INSERT INTO contents (titulo, link, created_at, resume_ai, ultima_revisao, data_ultima_revisao) VALUES (?, ?, ?, ?, 1, ?)",
      [titulo, link, created_at, resume_ai, created_at],
      callback
    );
  }

  static delete(id, callback) {
    db.run("DELETE FROM contents WHERE id = ?", [id], callback);
  }

  static getById(id, callback) {
    db.get("SELECT * FROM contents WHERE id = ?", [id], callback);
  }

  static updateRevisao(id, novoNivel, dataRevisao, callback) {
    db.run(
      "UPDATE contents SET ultima_revisao = ?, data_ultima_revisao = ? WHERE id = ?",
      [novoNivel, dataRevisao, id],
      callback
    );
  }

  static updateContent(id, titulo, link, callback) {
    db.run(
      "UPDATE contents SET titulo = ?, link = ? WHERE id = ?",
      [titulo, link, id],
      callback
    );
  }
}

module.exports = ContentModel;
