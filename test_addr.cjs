const { ethers } = require('ethers');
const addr = "0xC5d563A36323cf30f9A817465220f80a24E7c";
try {
    console.log("Original:", addr);
    console.log("Clean:", ethers.getAddress(addr));
} catch (e) {
    console.error("Error:", e.message);
}
