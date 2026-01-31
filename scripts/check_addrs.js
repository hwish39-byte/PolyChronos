import { ethers } from 'ethers';

const RPC_URL = "https://polygon.drpc.org";
const ADDR_OLD = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
const ADDR_NEW = "0xC5d563A36323cf30f9A817465220f80a24E7c";
const BLOCK = 59311100;

async function check() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log(`Checking block ${BLOCK}...`);
    
    const logsOld = await provider.getLogs({
        address: ADDR_OLD,
        fromBlock: BLOCK,
        toBlock: BLOCK + 100
    });
    console.log(`Old Address Logs: ${logsOld.length}`);

    const logsNew = await provider.getLogs({
        address: ADDR_NEW,
        fromBlock: BLOCK,
        toBlock: BLOCK + 100
    });
    console.log(`New Address Logs: ${logsNew.length}`);
}

check();