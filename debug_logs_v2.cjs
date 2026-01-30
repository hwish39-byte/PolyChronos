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
        
        const topics = new Set();
        logs.forEach(l => topics.add(l.topics[0]));
        
        console.log("Unique topics found:");
        for (const t of topics) {
            console.log(t);
        }

        const targetTopic = "0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c";
        const targetLogs = logs.filter(l => l.topics[0] === targetTopic);
        console.log(`\nLogs matching target topic ${targetTopic}: ${targetLogs.length}`);
        
        if (targetLogs.length > 0) {
            console.log("First target log topics:", targetLogs[0].topics);
            console.log("First target log data:", targetLogs[0].data);
        }

    } catch (e) {
        console.error(e);
    }
}

main();
