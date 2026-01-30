const { ethers } = require('ethers');

const ABI = [
    "event OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)"
];

const iface = new ethers.Interface(ABI);
const fragment = iface.getEvent("OrderFilled");
console.log("Topic:", fragment.topicHash);
console.log("Inputs:", fragment.inputs.length);
console.log("Indexed inputs:", fragment.inputs.filter(i => i.indexed).length);
