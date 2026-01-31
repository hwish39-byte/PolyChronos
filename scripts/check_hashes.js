
import { ethers } from 'ethers';

const events = [
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)",
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256)"
];

console.log("Expected Hashes:");
events.forEach(e => {
    console.log(`${e} -> ${ethers.id(e)}`);
});

console.log("\nFound Hashes:");
console.log("0xd0a08e8c... -> Unknown 1");
console.log("0x63bf4d16... -> Unknown 2");
