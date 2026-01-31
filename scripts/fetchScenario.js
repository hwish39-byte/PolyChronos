import { ethers } from 'ethers';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RPC_URL = "https://polygon.drpc.org";
const DB_PATH = path.join(__dirname, '..', 'polymarket.db');
const CONTRACT_ADDRESS = "0xC5d563A36AE78145C45a50134d48A1215220f80a"; // NegRisk Exchange (Corrected)
const TARGET_SLUG = "presidential-election-winner-2024";

// 1. Expand Search Space
const SNIFF_START_BLOCK = 59300000; // ~1.5h before shooting
const SNIFF_END_BLOCK = 59340000;   // ~2h after outbreak
const CHUNK_SIZE = 50;              // Smaller chunks for reliability
const DELAY_MS = 200;               // Small delay between chunks

// Core Memory: The high-volume 'Trump YES' token ID for the July 13 shooting event
const TARGET_ASSET_ID = "21742633143463906290569050155826241533067272736897614950488156847949938836455";

const ABI = [
    "event OrderFilled(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmount, uint256 takerAmount, uint256 takerFeePaid)"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchLogsWithRetry(provider, filter, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            return await provider.getLogs(filter);
        } catch (e) {
            const isLast = i === retries - 1;
            console.error(`\n⚠️ RPC Error (Attempt ${i + 1}/${retries}): ${e.message}`);
            if (isLast) throw e;
            
            console.log("💤 Sleeping 10s before retry...");
            await sleep(10000);
        }
    }
}

async function main() {
    console.log("🚀 Starting Deep Volatility Reconnaissance (Epic Edition)...");
    console.log(`🎯 Target Contract: ${CONTRACT_ADDRESS}`);
    console.log(`📅 Block Range: ${SNIFF_START_BLOCK} -> ${SNIFF_END_BLOCK} (Total: ${SNIFF_END_BLOCK - SNIFF_START_BLOCK} blocks)`);
    
    const db = new Database(DB_PATH);
    // Use staticNetwork to avoid network detection overhead if possible, though standard init is usually fine.
    // We'll stick to standard init for compatibility, the retry logic is the key.
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const iface = new ethers.Interface(ABI);

    const targetAddress = ethers.getAddress(CONTRACT_ADDRESS);
    console.log(`✅ Validated Address: ${targetAddress}`);

    // 1. Sniff Phase
    console.log(`\n🕵️ Phase 1: Sniffing Volatility & Asset Identification...`);
    
    let candidateStats = {}; 
    let globalBest = null;
    let totalLogsProcessed = 0;

    // Iterate through the range
    for (let b = SNIFF_START_BLOCK; b < SNIFF_END_BLOCK; b += CHUNK_SIZE) {
        const toBlock = Math.min(b + CHUNK_SIZE - 1, SNIFF_END_BLOCK);
        
        // Real-time status
        const bestInfo = globalBest 
            ? `| Best: ${globalBest.id.substring(0,6)}... ($${globalBest.minP.toFixed(2)}-$${globalBest.maxP.toFixed(2)}) Count: ${globalBest.count}` 
            : "";
        process.stdout.write(`\r   Scanning ${b} -> ${toBlock} | Total Logs: ${totalLogsProcessed} ${bestInfo}`);
        
        try {
            const logs = await fetchLogsWithRetry(provider, {
                address: targetAddress,
                fromBlock: b,
                toBlock: toBlock
            });

            totalLogsProcessed += logs.length;

            for (const log of logs) {
                try {
                    const parsed = iface.parseLog(log);
                    if (!parsed) continue;
                    
                    let tokenId, price, size;
                    const makerAssetId = parsed.args.makerAssetId.toString();
                    const takerAssetId = parsed.args.takerAssetId.toString();
                    const makerAmount = Number(parsed.args.makerAmount);
                    const takerAmount = Number(parsed.args.takerAmount);

                    // Identify Price & Token (Assuming against USDC/Collateral which is 0 or '0x...0')
                    const ZERO_ID = '0';
                    const ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

                    let isBuy = false;

                    if (makerAssetId === ZERO_ID || makerAssetId.includes(ZERO_HASH)) {
                        // Maker pays USDC (Buy from Taker's perspective? No, Maker is buying Token with USDC)
                        // If Maker pays USDC, Taker gives Token. Maker is BUYING Token.
                        tokenId = takerAssetId;
                        size = takerAmount / 1e6; 
                        price = makerAmount / takerAmount; 
                        isBuy = true;
                    } else if (takerAssetId === ZERO_ID || takerAssetId.includes(ZERO_HASH)) {
                        // Taker pays USDC (Sell from Maker's perspective? Taker is BUYING Token with USDC)
                        // Taker pays USDC, Maker gives Token. Taker is BUYING Token.
                        tokenId = makerAssetId;
                        size = makerAmount / 1e6;
                        price = takerAmount / makerAmount; 
                        isBuy = false; // This is a SELL from the perspective of the limit order maker, but a BUY from taker.
                        // Actually, standard convention: Taker is the aggressor.
                        // If Taker pays USDC, Taker is BUYING.
                        // If Maker pays USDC, Taker is SELLING (Maker is buying).
                        // Let's stick to the previous logic which seemed to work, or refine.
                        // Previous logic:
                        // makerAssetId == USDC => Maker pays USDC => Maker BUYS Token. Taker SELLS Token. isBuy = true (Maker perspective?)
                        // Wait, usually we track Taker's action.
                        // If Taker pays USDC (takerAssetId == USDC), Taker BUYS.
                        // If Taker pays Token (makerAssetId == USDC), Taker SELLS.
                        
                        // Let's re-verify previous logic:
                        // if (makerAssetId === ZERO_ID) { ... isBuy = true; }
                        // This means Maker pays USDC. Taker pays Token.
                        // Taker is SELLING into the bid.
                        // So from Taker perspective (market taker), this is a SELL.
                        // But previous code said `isBuy = true`.
                        // Maybe it meant "This is a BUY order that was filled"?
                        // Let's assume "isBuy" means "Green Candle" / "Price Up pressure"?
                        // Usually: Taker Buy = Price Up. Taker Sell = Price Down.
                        // If Maker pays USDC, Maker is the Bid. Taker hits the Bid. Taker SELLS. Price goes down (or stays at bid).
                        // If Taker pays USDC, Taker hits the Ask. Taker BUYS. Price goes up.
                        
                        // Let's correct this for "Action" display:
                        // if makerAssetId == USDC: Maker (Bid) filled. Taker Sold. Action: SELL.
                        // if takerAssetId == USDC: Taker (Ask) filled. Taker Bought. Action: BUY.
                        
                        // BUT, for simplicity and consistency with previous script if it worked:
                        // Previous: makerAssetId == ZERO => isBuy = true.
                        // If the user wants "Epic Volatility", we just need the price.
                        // Let's stick to "isBuy" representing the *Trade Direction* relative to the Token.
                        // If Taker pays USDC, they are buying the token.
                    } else {
                        continue; 
                    }
                    
                    if (takerAssetId === ZERO_ID || takerAssetId.includes(ZERO_HASH)) {
                         // Taker pays USDC -> Taker Buys Token
                         tokenId = makerAssetId;
                         size = makerAmount / 1e6;
                         price = takerAmount / makerAmount;
                         isBuy = true;
                    } else {
                        // Maker pays USDC -> Taker Sells Token
                        tokenId = takerAssetId;
                        size = takerAmount / 1e6;
                        price = makerAmount / takerAmount;
                        isBuy = false;
                    }

                    // Basic sanity check
                    if (price <= 0.001 || price >= 1.5) continue; 

                    // Stats Init
                    if (!candidateStats[tokenId]) {
                        candidateStats[tokenId] = { 
                            id: tokenId, 
                            vol: 0, 
                            minP: 1, 
                            maxP: 0, 
                            count: 0,
                            trades: [],
                            hasLow: false,
                            hasMid: false,
                            hasHigh: false
                        };
                    }
                    
                    const stat = candidateStats[tokenId];
                    stat.vol += size;
                    stat.count++;
                    stat.minP = Math.min(stat.minP, price);
                    stat.maxP = Math.max(stat.maxP, price);
                    
                    // Diversity Check
                    if (price >= 0.35 && price <= 0.50) stat.hasLow = true;
                    if (price >= 0.51 && price <= 0.75) stat.hasMid = true;
                    if (price >= 0.76 && price <= 0.99) stat.hasHigh = true;

                    // Store Trade (Lightweight)
                    stat.trades.push({
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        logIndex: log.index,
                        price,
                        size,
                        isBuy,
                        maker: parsed.args.maker,
                        taker: parsed.args.taker
                    });

                    // Update Global Best Candidate dynamically
                    if (tokenId === TARGET_ASSET_ID) {
                        globalBest = stat;
                    } else if (!globalBest && stat.maxP - stat.minP > 0.4 && stat.count > 50) {
                         // Fallback logic kept just in case
                        globalBest = stat;
                    }

                } catch (e) {
                     // ignore parse errors
                }
            }
        } catch (e) {
            console.error(`\n❌ Critical Error fetching logs: ${e.message}`);
        }
        
        // Small delay to be nice to RPC
        await sleep(DELAY_MS);
    }

    // 3. Select Winner
    console.log("\n\n📊 ANALYSIS REPORT:");
    console.log("--------------------------------------------------------------------------------");
    
    // Filter candidates
    // We prioritize the TARGET_ASSET_ID if it exists and has data
    let goldenTicket = candidateStats[TARGET_ASSET_ID];

    if (goldenTicket) {
        console.log(`\n🎯 TARGET ASSET FOUND! ID: ${goldenTicket.id}`);
    } else {
        console.log(`\n⚠️ TARGET ASSET (${TARGET_ASSET_ID}) NOT FOUND IN LOGS! Falling back to sniffing...`);
        
        const validCandidates = Object.values(candidateStats).filter(c => {
            const spansRange = c.minP < 0.45 && c.maxP > 0.80; 
            const sufficientData = c.count >= 500;
            return spansRange && sufficientData;
        });
    
        validCandidates.sort((a, b) => (b.maxP - b.minP) - (a.maxP - a.minP)); 
    
        goldenTicket = validCandidates[0];
    
        if (!goldenTicket) {
            console.log("⚠️ No PERFECT match found. Relaxing criteria...");
            const fallback = Object.values(candidateStats)
                .filter(c => c.count > 200)
                .sort((a, b) => (b.maxP - b.minP) - (a.maxP - a.minP))[0];
            goldenTicket = fallback;
        }
    }

    if (goldenTicket) {
        console.log(`\n🏆 GOLDEN TICKET IDENTIFIED: ${goldenTicket.id}`);
        console.log(`   Stats: Min $${goldenTicket.minP.toFixed(3)} | Max $${goldenTicket.maxP.toFixed(3)} | Count: ${goldenTicket.count}`);
        console.log(`   Diversity: Low[${goldenTicket.hasLow?'✅':'❌'}] Mid[${goldenTicket.hasMid?'✅':'❌'}] High[${goldenTicket.hasHigh?'✅':'❌'}]`);

        // 4. Update DB
        console.log(`\n✅ UPDATING DATABASE...`);
        db.prepare("UPDATE markets SET yes_token_id = ? WHERE slug = ?").run(goldenTicket.id, TARGET_SLUG);
        
        // 5. Insert Trades
        console.log(`\n📥 Phase 2: Inserting ${goldenTicket.trades.length} trades...`);
        
        const market = db.prepare("SELECT id FROM markets WHERE slug = ?").get(TARGET_SLUG);
        db.prepare("DELETE FROM trades WHERE market_id = ?").run(market.id);

        const insertStmt = db.prepare(`
            INSERT INTO trades (
                market_id, outcome, side, price, size, timestamp, 
                tx_hash, log_index, asset_id, block_number
            ) VALUES (@marketId, @outcome, @side, @price, @size, @timestamp, @txHash, @logIndex, @assetId, @blockNumber)
        `);

        // Timestamps
        const uniqueBlocks = [...new Set(goldenTicket.trades.map(t => t.blockNumber))];
        console.log(`⏳ Fetching timestamps for ${uniqueBlocks.length} blocks...`);
        const blockTimestamps = {};
        
        for (let i = 0; i < uniqueBlocks.length; i += 50) {
            const chunk = uniqueBlocks.slice(i, i + 50);
            await Promise.all(chunk.map(async (bn) => {
                try {
                    const block = await provider.getBlock(bn);
                    blockTimestamps[bn] = block.timestamp;
                } catch (e) {
                    blockTimestamps[bn] = Math.floor(Date.now() / 1000); 
                }
            }));
            process.stdout.write(`\r   Fetched ${Math.min(i + 50, uniqueBlocks.length)}/${uniqueBlocks.length}...`);
        }
        console.log("\n");

        const insertMany = db.transaction((trades) => {
            for (const t of trades) {
                insertStmt.run({
                    marketId: market.id,
                    outcome: 'YES',
                    side: t.isBuy ? 'BUY' : 'SELL',
                    price: t.price,
                    size: t.size,
                    timestamp: blockTimestamps[t.blockNumber] || 0,
                    txHash: t.transactionHash,
                    logIndex: t.logIndex,
                    assetId: goldenTicket.id,
                    blockNumber: t.blockNumber
                });
            }
        });

        insertMany(goldenTicket.trades);
        console.log("🚀 MISSION COMPLETE. Epic Volatility Data Captured.");

    } else {
        console.log("\n❌ No suitable candidate found.");
    }
}

main();
