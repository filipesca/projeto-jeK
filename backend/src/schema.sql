CREATE TABLE
  IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    datetime TEXT NOT NULL,
    guests INTEGER NOT NULL,
    notes TEXT,
    table_number INTEGER NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

INSERT
OR IGNORE INTO settings (key, value)
VALUES
  ('total_tables', '10');