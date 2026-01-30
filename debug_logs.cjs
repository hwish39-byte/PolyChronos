const { ethers } = require('ethers');

async function main() {
    const provider = new ethers.JsonRpcProvider('https://polygon.drpc.org');
    const address = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
    const from = 59311700;
    const to = 59312000;

    console.log(`Checking logs for ${address} from ${from} to ${to}...`);

    try {
        const logs = await provider.getLogs({
            address: address,
            fromBlock: from,
            toBlock: to
        });
        console.log(`Found ${logs.length} logs.`);
        if (logs.length > 0) {
            console.log("First log topics:", logs[0].topics);
            console.log("First log data:", logs[0].data);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
