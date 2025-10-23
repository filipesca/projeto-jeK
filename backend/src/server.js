import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import db from "./db.js";
import { authMiddleware, generateToken } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Funções auxiliares

function getTotalTables() {
  const row = db
    .prepare("SELECT value FROM settings WHERE key=?")
    .get("total_tables");
  return parseInt(row?.value || "10", 10);
}
function setTotalTables(n) {
  db.prepare(
    "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
  ).run("total_tables", String(n));
}
function isOverlap(dt1, dt2) {
  const a = new Date(dt1).getTime(),
    b = new Date(dt2).getTime();
  return Math.abs(a - b) < 60 * 60 * 1000;
}

// Login admin
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "1234") {
    return res.json({
      token: generateToken({ role: "admin" }, process.env.JWT_SECRET),
    });
  }
  return res.status(401).json({ error: "Credenciais inválidas" });
});

// Verifica mesas disponíveis para um horário
app.get("/api/available-tables", (req, res) => {
  const { datetime } = req.query;
  if (!datetime)
    return res
      .status(400)
      .json({ error: "Parâmetro datetime é obrigatório (ISO)" });
  const total = getTotalTables();
  const rows = db
    .prepare("SELECT table_number, datetime FROM reservations")
    .all();
  const taken = new Set(
    rows
      .filter((r) => isOverlap(r.datetime, datetime))
      .map((r) => r.table_number)
  );
  const available = [];
  for (let t = 1; t <= total; t++) if (!taken.has(t)) available.push(t);
  res.json({ available, total });
});

// Cria reserva
app.post("/api/reservations", (req, res) => {
  const { name, phone, datetime, guests, notes, table_number } = req.body || {};
  if (!name || !phone || !datetime || !guests) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  function takenTablesAt(dt) {
    const rows = db
      .prepare("SELECT table_number, datetime FROM reservations")
      .all();
    return new Set(
      rows.filter((r) => isOverlap(r.datetime, dt)).map((r) => r.table_number)
    );
  }
  function isTableFree(dt, tn) {
    const total = getTotalTables();
    if (!Number.isInteger(tn) || tn < 1 || tn > total) return false;
    return !takenTablesAt(dt).has(tn);
  }

  let table;
  if (table_number != null) {
    const tn = Number(table_number);
    if (!isTableFree(datetime, tn)) {
      return res
        .status(409)
        .json({ error: "Mesa indisponível para este horário" });
    }
    table = tn;
  } else {
    const total = getTotalTables();
    const taken = takenTablesAt(datetime);
    for (let t = 1; t <= total; t++) {
      if (!taken.has(t)) {
        table = t;
        break;
      }
    }
    if (!table)
      return res
        .status(409)
        .json({ error: "Sem mesas disponíveis neste horário" });
  }

  const info = db
    .prepare(
      "INSERT INTO reservations (name, phone, datetime, guests, notes, table_number) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(name, phone, datetime, guests, notes || "", table);

  return res
    .status(201)
    .json({ id: info.lastInsertRowid, table_number: table });
});

// Listar e Cancelar reserva
app.get("/api/reservations", authMiddleware, (req, res) => {
  res.json(
    db.prepare("SELECT * FROM reservations ORDER BY datetime DESC").all()
  );
});
app.delete("/api/reservations/:id", authMiddleware, (req, res) => {
  const info = db
    .prepare("DELETE FROM reservations WHERE id = ?")
    .run(Number(req.params.id));
  if (info.changes === 0)
    return res.status(404).json({ error: "Não encontrado" });
  res.json({ ok: true });
});

// Resumo diario
app.get("/api/summary", authMiddleware, (req, res) => {
  const { date } = req.query;
  if (!date)
    return res
      .status(400)
      .json({ error: "Parâmetro date é obrigatório (YYYY-MM-DD)" });
  const start = new Date(date + "T00:00"),
    end = new Date(date + "T23:59");
  const rows = db.prepare("SELECT * FROM reservations").all();
  const day = rows.filter((r) => {
    const t = new Date(r.datetime).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const total_reservations = day.length;
  const total_guests = day.reduce((s, r) => s + Number(r.guests || 0), 0);
  const total_tables = getTotalTables();
  const occupiedPerHour = {};
  for (const r of day) {
    const k = new Date(r.datetime).toISOString().slice(0, 13) + ":00";
    occupiedPerHour[k] = (occupiedPerHour[k] || 0) + 1;
  }
  const max_occupied = Math.max(0, ...Object.values(occupiedPerHour));
  res.json({
    total_reservations,
    total_guests,
    total_tables,
    max_occupied,
    available_at_peak: Math.max(0, total_tables - max_occupied),
  });
});

// Configuracoes
app.get("/api/settings", authMiddleware, (req, res) =>
  res.json({ total_tables: getTotalTables() })
);
app.put("/api/settings", authMiddleware, (req, res) => {
  const n = Number((req.body || {}).total_tables);
  if (!Number.isInteger(n) || n < 1)
    return res.status(400).json({ error: "total_tables inválido" });
  setTotalTables(n);
  res.json({ ok: true, total_tables: n });
});

// Inicializa o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
