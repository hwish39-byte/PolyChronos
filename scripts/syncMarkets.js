import { ethers } from 'ethers';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../polymarket.db');

// Hardcoded values from user
const TARGET_MARKET = {
    slug: "presidential-election-winner-2024",
    conditionId: "0x291c36085a5e37841c73797979116e0331316330333033303330333033303330",
    contract: "0x4d97dcd5d545da744bb9d6d8d824391755979391"
};

const PARENT_COLLECTION_ID = ethers.ZeroHash;
const COLLATERAL_TOKEN = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC.e

function calculateTokenIds(conditionId) {
    // collectionId_yes = keccak256(parentCollectionId, conditionId, 1)
    const collectionIdYes = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32", "uint256"],
        [PARENT_COLLECTION_ID, conditionId, 1]
    );

    // collectionId_no = keccak256(parentCollectionId, conditionId, 2)
    const collectionIdNo = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32", "uint256"],
        [PARENT_COLLECTION_ID, conditionId, 2]
    );

    // yes_token_id = keccak256(collateralToken, collectionId_yes)
    const yesTokenId = ethers.solidityPackedKeccak256(
        ["address", "bytes32"],
        [COLLATERAL_TOKEN, collectionIdYes]
    );

    // no_token_id = keccak256(collateralToken, collectionId_no)
    const noTokenId = ethers.solidityPackedKeccak256(
        ["address", "bytes32"],
        [COLLATERAL_TOKEN, collectionIdNo]
    );

    return { yesTokenId, noTokenId };
}

async function main() {
    const db = new Database(dbPath);
    console.log(`📂 Database: ${dbPath}`);

    // Use specific RPC with staticNetwork optimization
    const provider = new ethers.JsonRpcProvider(
        "https://polygon-rpc.com",
        { chainId: 137, name: 'polygon' },
        { staticNetwork: true }
    );
    
    // Test provider connection (optional but good for verification)
    try {
        console.log("📡 Connecting to RPC...");
        const block = await provider.getBlockNumber();
        console.log(`✅ Connected to Polygon. Current block: ${block}`);
    } catch (error) {
        console.error("❌ Failed to connect to provider:", error.message);
    }

    const { yesTokenId, noTokenId } = calculateTokenIds(TARGET_MARKET.conditionId);
    console.log(`Calculated Token IDs:`);
    console.log(`YES: ${yesTokenId}`);
    console.log(`NO:  ${noTokenId}`);

    const upsertStmt = db.prepare(`
        INSERT INTO markets (slug, condition_id, question_id, oracle, yes_token_id, no_token_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(condition_id) DO UPDATE SET
            slug = excluded.slug,
            question_id = excluded.question_id,
            oracle = excluded.oracle,
            yes_token_id = excluded.yes_token_id,
            no_token_id = excluded.no_token_id,
            status = excluded.status
    `);

    try {
        const info = upsertStmt.run(
            TARGET_MARKET.slug,
            TARGET_MARKET.conditionId,
            null, // question_id not provided
            TARGET_MARKET.contract, // Using contract as oracle reference
            yesTokenId,
            noTokenId,
            'ACTIVE'
        );
        console.log(`✅ Market upserted. Changes: ${info.changes}`);
    } catch (err) {
        console.error("❌ Database error:", err);
    } finally {
        db.close();
    }
}

main();
