import { ethers } from 'ethers';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../polymarket.db');

// Corrected NegRisk CTF Exchange address
const CONTRACT_ADDRESSES = [
    "0xC5d563A36AE78145C45a50134d48A1215220f80a"
];

const RPC_URLS = [
    "https://polygon.drpc.org",
    "https://polygon-rpc.com",
    "https://1rpc.io/matic"
];

// ABI variants to handle different event signatures
    const ABI = [
        // 8-arg OrderFilled (3 indexed: orderHash, maker, taker)
        "event OrderFilled(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)",
        // 10-arg OrdersMatched (matching 0x6571...)
        "event OrdersMatched(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee, uint256 unknown1, uint256 unknown2)",
        // 9-arg OrdersMatched (variant?)
        "event OrdersMatched(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee, uint256 unknown1)",
        // 9-arg OrderFilled (3 indexed) - The one user suggested (hash 0x9021...)
        "event OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)"
    ];

const iface = new ethers.Interface(ABI);

async function getProvider() {
    for (let url of RPC_URLS) {
        try {
            const provider = new ethers.JsonRpcProvider(
                url, 
                { chainId: 137, name: 'polygon' }, 
                { staticNetwork: true }
            );
            await provider.getBlockNumber();
            return provider;
        } catch {}
    }
    throw new Error("All RPC nodes failed.");
}

function getMarketInfo(db) {
    const row = db.prepare('SELECT id, yes_token_id FROM markets WHERE slug = ?').get('presidential-election-winner-2024');
    if (!row) throw new Error('Market not found: presidential-election-winner-2024');
    return row;
}

async function main() {
    const db = new Database(dbPath);
    const { id: marketId, yes_token_id: yesTokenId } = getMarketInfo(db);
    const provider = await getProvider();

    const SYNC_KEY = 'negrisk_exchange_0xc5d563a36ae78145c45a50134d48a1215220f80a';
    
    // Force Capture Range
    const hardStart = 59311000;
    const hardEnd = 59320000;
    const chunkSize = 50;
    const minTradesToStop = 50;

    let startBlock = hardStart;
    
    console.log(`🚀 Starting Force Capture from block ${startBlock} (End: ${hardEnd})`);
    console.log(`🎯 Target: ${minTradesToStop} trades (Saving ALL OrderFilled events)`);
    console.log(`📝 Contract: ${CONTRACT_ADDRESSES[0]}`);

    const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO trades (
            tx_hash, log_index, market_id, outcome, side, price, size, timestamp, asset_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((trades) => {
        for (const t of trades) {
            insertStmt.run(t.tx_hash, t.log_index, t.market_id, t.outcome, t.side, t.price, t.size, t.timestamp, t.asset_id);
        }
    });

    const upsertSync = db.prepare(`
        INSERT INTO sync_state (key, last_block)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET last_block = excluded.last_block
    `);

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const isRateLimit = (err) => {
        const m = String(err && err.message || '').toLowerCase();
        return m.includes('too many requests') || m.includes('rate limit');
    };

    let totalTradesFound = 0;
    const failedChunks = [];

    for (let from = startBlock; from <= hardEnd; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, hardEnd);
        console.log(`DEBUG: Processing chunk ${from}-${to}...`);
        let chunkLogs = [];
        for (const addr of CONTRACT_ADDRESSES) {
            let cleanAddr;
            try {
                cleanAddr = ethers.getAddress(addr);
            } catch {
                continue;
            }
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const logs = await provider.getLogs({
                        address: cleanAddr,
                        fromBlock: from,
                        toBlock: to
                    });
                    if (logs && logs.length) chunkLogs.push(...logs);
                    break;
                } catch (err) {
                    if (isRateLimit(err) && attempt === 0) {
                        console.log(`⚠️ Rate limit hit. Sleeping 10s...`);
                        await sleep(10000);
                        continue;
                    }
                    console.error(`❌ [${from} - ${to}] ${err.message}`);
                    failedChunks.push({ from, to, address: cleanAddr, error: String(err.message || err) });
                    await sleep(5000);
                    break;
                }
            }
        }

        const blockTimestamps = new Map();
        if (chunkLogs.length > 0) {
            const uniqBlocks = [...new Set(chunkLogs.map(l => l.blockNumber))];
            for (let i = 0; i < uniqBlocks.length; i += 10) {
                const batch = uniqBlocks.slice(i, i + 10);
                await Promise.all(batch.map(async (bn) => {
                    try {
                        const b = await provider.getBlock(bn);
                        blockTimestamps.set(bn, b.timestamp);
                    } catch {}
                }));
            }
        }

        console.log(`DEBUG: Found ${chunkLogs.length} raw logs in chunk ${from}-${to}`);
        const trades = [];
        for (const log of chunkLogs) {
            let parsed = null;
            try {
                parsed = iface.parseLog(log);
            } catch (e) {
                if (log.topics && log.topics[0] === '0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c') {
                    console.log(`[FOUND 0x63bf] But failed to parse! Data len: ${log.data.length} Topics: ${log.topics.length}`);
                }
                continue;
            }
            
            if (!parsed) continue;

            if (parsed.name !== 'OrderFilled' && parsed.name !== 'OrdersMatched') {
                 continue;
            }

            let makerAssetId, takerAssetId, makerAmountFilled, takerAmountFilled;
            let version = 'unknown';

            if (parsed.name === 'OrdersMatched') {
                 // OrdersMatched usually has makerAssetId at index 3 (if 3 indexed)
                 // Use names if possible, else positional
                 // Based on 10-arg ABI: makerAssetId is likely arg 3 or 4 depending on indexed count
                 // But we defined it as 3 indexed: orderHash, maker, taker. So makerAssetId is 1st non-indexed?
                 // No, ethers `args` includes indexed args.
                 // So makerAssetId is likely at index 3 (0=orderHash, 1=maker, 2=taker, 3=makerAssetId)
                 if (parsed.args.makerAssetId !== undefined) {
                     makerAssetId = parsed.args.makerAssetId;
                     takerAssetId = parsed.args.takerAssetId;
                     makerAmountFilled = parsed.args.makerAmountFilled;
                     takerAmountFilled = parsed.args.takerAmountFilled;
                 } else {
                     makerAssetId = parsed.args[3];
                     takerAssetId = parsed.args[4];
                     makerAmountFilled = parsed.args[5];
                     takerAmountFilled = parsed.args[6];
                 }
                 version = 'OrdersMatched';
            } else if (parsed.name === 'OrderFilled') {
                const inputCount = parsed.fragment.inputs.length;
                if (inputCount === 9) {
                    version = 'negrisk_9';
                    makerAssetId = parsed.args[4];
                    takerAssetId = parsed.args[5];
                    makerAmountFilled = parsed.args[6];
                    takerAmountFilled = parsed.args[7];
                } else if (inputCount === 8) {
                    version = 'negrisk_8';
                    makerAssetId = parsed.args[3];
                    takerAssetId = parsed.args[4];
                    makerAmountFilled = parsed.args[5];
                    takerAmountFilled = parsed.args[6];
                } else {
                    // Fallback
                     makerAssetId = parsed.args[3];
                     takerAssetId = parsed.args[4];
                     makerAmountFilled = parsed.args[5];
                     takerAmountFilled = parsed.args[6];
                }
            }

                if (makerAssetId === undefined) {
                    console.log(`DEBUG: Could not map args for ${inputCount}-arg event`);
                    continue;
                }
                
                const side = makerAssetId === 0n ? 'BUY' : 'SELL';
                const assetId = makerAssetId !== 0n ? makerAssetId : takerAssetId;
                const assetHex = ethers.toBeHex(assetId, 32).toLowerCase();
                const yesTokenIdLower = yesTokenId.toLowerCase();
                
                const outcome = assetHex === yesTokenIdLower ? 'YES' : 'NO';
                
                // FORCE CAPTURE: Ignore filter
                // if (assetHex !== yesTokenIdLower && assetId !== 0n) { ... }

                const collateralUSDC = makerAmountFilled; // Assuming makerAmountFilled is collateral (USDC)
                const tokensAmount = takerAmountFilled; // Assuming takerAmountFilled is shares (Tokens)
                
                const collateral = Number(ethers.formatUnits(collateralUSDC, 6));
                const shares = Number(ethers.formatUnits(tokensAmount, 6)); // NegRisk tokens are often 6 decimals too? Or 18? User said 6.
                
                const price = shares > 0 ? collateral / shares : 0;
                const size = shares;
                const timestamp = blockTimestamps.get(log.blockNumber) || Math.floor(Date.now() / 1000);

                console.log(`[SUCCESS] Price: ${price.toFixed(2)} | Side: ${side}`);

                trades.push({
                    tx_hash: log.transactionHash,
                    log_index: log.index ?? log.logIndex ?? 0,
                    market_id: marketId,
                    outcome, // Use 'YES' or 'NO' to satisfy CHECK constraint
                    side,
                    price,
                    size,
                    timestamp,
                    asset_id: assetHex
                });
        }

        insertMany(trades);
        
        if (trades.length > 0) {
            totalTradesFound += trades.length;
            console.log(`SUCCESS: Saved ${trades.length} trades for blocks ${from} to ${to}. Total: ${totalTradesFound}`);
        }

        upsertSync.run(SYNC_KEY, to);

        if (totalTradesFound >= minTradesToStop) {
            console.log(`🎉 Target reached (${totalTradesFound} trades). Stopping.`);
            break;
        }

        await sleep(1000);
    }

    if (failedChunks.length) {
        console.log(`⚠️ Failed chunks: ${failedChunks.length}`);
    }

    db.close();
}

main().catch(console.error);
