const { ethers } = require('ethers');

const ABI = [
    "event OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled)",
    "event OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)"
];

const iface = new ethers.Interface(ABI);
console.log("8-arg hash:", iface.getEvent("OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256)").topicHash);
console.log("9-arg hash:", iface.getEvent("OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)").topicHash);
