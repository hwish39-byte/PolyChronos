import { ethers } from 'ethers';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = "https://polygon.drpc.org";
const CONTRACT_ADDRESS = "0xC5d563A36AE78145C45a50134d48A1215220f80a"; 
const SNIFF_START_BLOCK = 59311000;
const SNIFF_END_BLOCK = 59330000; 
const CHUNK_SIZE = 2000; 

const ABI = [
    "event OrderFilled(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmount, uint256 takerAmount, uint256 takerFeePaid)"
];

async function main() {
    console.log("🚀 Starting Market Scanner...");
    const provider = new ethers.JsonRpcProvider(RPC_URL, 137, { staticNetwork: true });
    const iface = new ethers.Interface(ABI);

    let candidateStats = {}; 
    
    for (let b = SNIFF_START_BLOCK; b < SNIFF_END_BLOCK; b += CHUNK_SIZE) {
        const toBlock = Math.min(b + CHUNK_SIZE - 1, SNIFF_END_BLOCK);
        console.log(`   Scanning ${b} -> ${toBlock}...`);
        
        try {
            const logs = await provider.getLogs({
                address: CONTRACT_ADDRESS,
                fromBlock: b,
                toBlock: toBlock
            });

            for (const log of logs) {
                try {
                    const parsed = iface.parseLog(log);
                    if (!parsed) continue;
                    
                    let tokenId, price, size;
                    const makerAssetId = parsed.args.makerAssetId.toString();
                    const takerAssetId = parsed.args.takerAssetId.toString();
                    const makerAmount = Number(parsed.args.makerAmount);
                    const takerAmount = Number(parsed.args.takerAmount);

                    if (makerAssetId === '0' || makerAssetId === '0000000000000000000000000000000000000000000000000000000000000000') {
                        tokenId = takerAssetId;
                        size = takerAmount / 1e6;
                        price = makerAmount / takerAmount;
                    } else if (takerAssetId === '0' || takerAssetId === '0000000000000000000000000000000000000000000000000000000000000000') {
                        tokenId = makerAssetId;
                        size = makerAmount / 1e6;
                        price = takerAmount / makerAmount;
                    } else {
                        continue; 
                    }

                    if (price <= 0.01 || price >= 0.99) continue;

                    if (!candidateStats[tokenId]) {
                        candidateStats[tokenId] = { 
                            id: tokenId, 
                            vol: 0, 
                            minP: 1, 
                            maxP: 0, 
                            count: 0
                        };
                    }
                    
                    const stat = candidateStats[tokenId];
                    stat.vol += size;
                    stat.count++;
                    stat.minP = Math.min(stat.minP, price);
                    stat.maxP = Math.max(stat.maxP, price);

                } catch (e) {}
            }
        } catch (e) {
            console.error(e.message);
        }
    }

    console.log("\n📊 Top 10 Assets by Volume:");
    const candidates = Object.values(candidateStats).sort((a, b) => b.vol - a.vol);
    
    candidates.slice(0, 10).forEach((c, i) => {
        console.log(`   ${i+1}. ID: ${c.id.substring(0, 20)}... | Vol: ${c.vol.toFixed(0)} | Price: ${c.minP.toFixed(3)} - ${c.maxP.toFixed(3)} | Count: ${c.count}`);
    });
}

main();
