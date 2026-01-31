
import { ethers } from 'ethers';

const targetHash = "0xd0a08e8c"; // First 4 bytes? No, log topic is 32 bytes.
// Wait, I only saw the start. I need the full hash.
// In check_hashes output: 0xd0a08e8c...
// I'll assume it starts with d0a08e8c.

const variations = [
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)", // 8 args
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256)", // 6 args
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256)", // 7 args
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256,bytes)"
];

console.log("Checking hashes for 0x63bf4d16...");
variations.forEach(v => {
    const h = ethers.id(v);
    console.log(`${v} \n -> ${h}`);
    if (h.startsWith("0x63bf4d16")) {
        console.log("MATCH FOUND! ^^^^^");
    }
});
