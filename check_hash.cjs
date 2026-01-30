const { ethers } = require('ethers');

const sig = "OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)";
// Note: "indexed" doesn't affect the hash of the signature string itself, but we need the canonical form.
// User said: OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)
// Canonical form for hash: OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)

console.log(`Signature: ${sig}`);
console.log(`Hash: ${ethers.id(sig)}`);

const sigMatched = "OrdersMatched(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)";
console.log(`Signature: ${sigMatched}`);
console.log(`Hash: ${ethers.id(sigMatched)}`);
