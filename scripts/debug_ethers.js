
import { ethers } from 'ethers';

const RPC_URL = "https://polygon.drpc.org";
const ADDR = "0xC5d563A36323cf30f9A817465220f80a24E7c";

async function main() {
    console.log(`Address: ${ADDR}`);
    try {
        const checksum = ethers.getAddress(ADDR);
        console.log(`Checksum: ${checksum}`);
    } catch (e) {
        console.error(`Invalid address: ${e.message}`);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL, 137, { staticNetwork: true });
    
    console.log("Getting logs...");
    try {
        const logs = await provider.getLogs({
            address: ADDR,
            fromBlock: 59311000,
            toBlock: 59311010
        });
        console.log(`Logs found: ${logs.length}`);
    } catch (e) {
        console.error(`GetLogs Error:`, e);
    }
}

main();
