const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../contents.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TEXT NOT NULL,
    resume_ai TEXT,
    ultima_revisao INTEGER DEFAULT 1,
    data_ultima_revisao TEXT
  )`,
    (err) => {
      if (err) console.log("Tabela já existe");
    }
  );

  db.run("ALTER TABLE contents ADD COLUMN resume_ai TEXT", (err) => {
    if (err) console.log("Coluna resume_ai já existe");
  });

  db.run(
    "ALTER TABLE contents ADD COLUMN ultima_revisao INTEGER DEFAULT 1",
    (err) => {
      if (err) console.log("Coluna ultima_revisao já existe");
    }
  );

  db.run("ALTER TABLE contents ADD COLUMN data_ultima_revisao TEXT", (err) => {
    if (err) console.log("Coluna data_ultima_revisao já existe");
  });
});

module.exports = db;
