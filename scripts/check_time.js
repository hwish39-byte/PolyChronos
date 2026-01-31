import { ethers } from 'ethers';

const RPC_URL = "https://polygon.drpc.org";
const provider = new ethers.JsonRpcProvider(RPC_URL, 137, { staticNetwork: true });

async function main() {
    const block = await provider.getBlock(59311000);
    console.log(`Block 59311000 Timestamp: ${block.timestamp} (${new Date(block.timestamp * 1000).toUTCString()})`);
    
    // Check target time for shooting: July 13, 2024 22:11 UTC
    const targetTime = 1720908660; // 22:11 UTC
    console.log(`Target Time (Shooting): ${targetTime} (${new Date(targetTime * 1000).toUTCString()})`);
    
    // Estimate block for target time
    const diff = targetTime - block.timestamp;
    const blocks = Math.floor(diff / 2.2); // ~2.2s per block
    console.log(`Estimated Block for Shooting: ${59311000 + blocks}`);
}

main();
