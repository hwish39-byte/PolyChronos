const { ethers } = require('ethers');

// 8-arg OrderFilled
const sig8 = "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)";
console.log(`Signature: ${sig8}`);
console.log(`Hash: ${ethers.id(sig8)}`);

const target = "0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c";
console.log(`Target: ${target}`);
console.log(`Match? ${ethers.id(sig8) === target}`);
