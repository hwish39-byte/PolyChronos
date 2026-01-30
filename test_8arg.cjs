const { ethers } = require('ethers');

const ABI = [
    "event OrderFilled(bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)"
];

const iface = new ethers.Interface(ABI);
const log = {
    topics: [
        '0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6', // The topic I saw
        '0x0000000000000000000000000000000000000000000000000000000000000000', // Mock orderHash
        '0x0000000000000000000000001234567890123456789012345678901234567890'  // Mock maker
    ],
    data: '0x' + '0'.repeat(64*6) // Mock data (6 uint256s?)
};

// Wait, if it has 8 args, and 2 are indexed (orderHash, maker).
// Then data should contain: taker (address -> 32 bytes), makerAssetId, takerAssetId, makerAmt, takerAmt, fee.
// Total 6 data fields. 6 * 32 bytes = 192 bytes.
// '0'.repeat(64*6) = 384 chars = 192 bytes.

try {
    const parsed = iface.parseLog(log);
    console.log("Parsed successfully!");
    console.log("Name:", parsed.name);
    console.log("Args:", parsed.args);
} catch (e) {
    console.log("Parse failed:", e.message);
}
