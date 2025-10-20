// Configuração da base de dados SQLite
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Caminho do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do db e schema
const dbPath = path.resolve(__dirname, "..", "data.sqlite");
const schemaPath = path.resolve(__dirname, "schema.sql");

// Abre ou cria o banco
const db = new Database(dbPath);

// Executa o schema
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

export default db;
