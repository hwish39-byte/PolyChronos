import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
const port = 3001;
const db = new Database('polymarket.db');

// GET /api/markets - List available scenarios
app.get('/api/markets', (req, res) => {
    try {
        const markets = db.prepare('SELECT * FROM markets').all();
        res.json(markets);
    } catch (error) {
        console.error('Error fetching markets:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/trades/:slug - Get trades for a specific market
app.get('/api/trades/:slug', (req, res) => {
    const { slug } = req.params;
    try {
        // Find market by slug to get ID
        const market = db.prepare('SELECT id FROM markets WHERE slug = ?').get(slug);
        
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }

        // Get trades for market
        // Format: [{ time: number, price: number, side: string, outcome: string, blockNumber: number }]
        const trades = db.prepare(`
            SELECT timestamp as time, price, side, outcome, block_number as blockNumber
            FROM trades 
            WHERE market_id = ? 
            ORDER BY timestamp ASC
        `).all(market.id);

        res.json(trades);
    } catch (error) {
        console.error(`Error fetching trades for ${slug}:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
