import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../polymarket.db');
const db = new Database(dbPath);

const keysToDelete = [
    'negrisk_exchange_0xc5d563a36ae78145c45a50134d48a1215220f80a', // The one in the script
    '0xC5d563A36323cf30f9A817465220f80a24E7c' // The one user provided
];

const stmt = db.prepare('DELETE FROM sync_state WHERE key LIKE ?');

keysToDelete.forEach(key => {
    const info = stmt.run(`%${key}%`);
    console.log(`Deleted rows for key like '${key}': ${info.changes}`);
});

console.log('Sync state reset complete.');
db.close();
