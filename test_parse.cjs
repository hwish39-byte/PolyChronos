const { ethers } = require('ethers');

const log = {
    topics: [
        '0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c',
        '0x15b1fc858544f0896f9530c18095c019d68046c0e64c128988e4bfba8b3bd6fe',
        '0x000000000000000000000000d74e83dfd8609439e0203cdf0e2066306047045d'
    ],
    data: '0x00000000000000000000000000000000000000000000000000000000000000003011e4ede0f6befa0ad3f571001d3e1ffeef3d4af78c3112aaac90416e3a43e700000000000000000000000000000000000000000000000000000000005b8d800000000000000000000000000000000000000000000000000000000000989680'
};

const variants = [
    // User provided (3 indexed) - expecting failure
    "event OrderFilled(bytes32 indexed context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)",
    // 2 indexed (context NOT indexed)
    "event OrderFilled(bytes32 context, bytes32 indexed orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)",
    // 2 indexed (orderHash NOT indexed)
    "event OrderFilled(bytes32 indexed context, bytes32 orderHash, address indexed maker, address taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)"
];

variants.forEach((v, i) => {
    try {
        const iface = new ethers.Interface([v]);
        const parsed = iface.parseLog(log);
        console.log(`Variant ${i} SUCCESS:`);
        console.log(`  makerAssetId: ${parsed.args.makerAssetId}`);
        console.log(`  takerAssetId: ${parsed.args.takerAssetId}`);
        console.log(`  maker: ${parsed.args.maker}`);
    } catch (e) {
        console.log(`Variant ${i} FAILED: ${e.message}`);
    }
});
