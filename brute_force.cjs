const { ethers } = require('ethers');

const target = "0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c";

const types = [
    "bytes32", "address", "uint256"
];

const variants = [
    // Standard NegRisk with fee?
    "OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)", 
    // Maybe fee is last?
    "OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)",
    // Maybe orderHash is not there?
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)",
    // Maybe context is not there?
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
    // Maybe uint256 fee is not there but something else?
    
    // Let's try to construct it.
    // 0xd0a0... was (bytes32,address,address,uint256,uint256,uint256,uint256,uint256) (8 args)
    // Maybe 0x63bf... is the same but with one more uint256?
    "OrderFilled(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)",
    
    // Maybe it has orderHash?
    "OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)", // Already checked?
    
    // CTF Exchange specific?
    "OrderFilled(bytes32,bytes32,uint256,address,address,uint256,uint256,uint256,uint256,uint256)",
    
    // Try some permutations
    "OrderFilled(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)",
];

const generated = [
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256,uint256)",
    "OrdersMatched(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256)",
    "OrdersMatched(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)",
    "OrdersMatched(bytes32,bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256)"
];

generated.forEach(sig => {
    const hash = ethers.id(sig);
    console.log(`${hash} ${sig}`);
});

const targets = [
    "0x63bf4d16b7fa898ef4c4b2b6d90fd201e9c56313b65638af6088d149d2ce956c",
    "0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6"
];

