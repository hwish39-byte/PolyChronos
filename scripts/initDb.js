import Database from "better-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "..", "polymarket.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS markets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT,
    condition_id TEXT NOT NULL UNIQUE,
    question_id TEXT,
    oracle TEXT,
    yes_token_id TEXT,
    no_token_id TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    market_id INTEGER NOT NULL REFERENCES markets(id),
    outcome TEXT NOT NULL CHECK (outcome IN ('YES', 'NO')),
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    price REAL NOT NULL,
    size REAL NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_tx_log ON trades (tx_hash, log_index);

  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    last_block INTEGER NOT NULL
  );
`);

db.close();
console.log(`Database initialized at ${dbPath}`);
