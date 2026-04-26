const { ethers } = require("hardhat");

const PROXY_ADDRESS = "0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00";

// ERC-1967 storage slots
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

async function main() {
  const provider = ethers.provider;

  console.log("Proxy Address:", PROXY_ADDRESS);
  console.log("-----------------------------------------------");

  // Read implementation address from storage slot
  const implHex = await provider.getStorageAt(PROXY_ADDRESS, IMPLEMENTATION_SLOT);
  const implementation = ethers.utils.getAddress("0x" + implHex.slice(-40));
  console.log("Implementation Address:", implementation);

  // Read admin address from storage slot
  const adminHex = await provider.getStorageAt(PROXY_ADDRESS, ADMIN_SLOT);
  const admin = ethers.utils.getAddress("0x" + adminHex.slice(-40));
  console.log("ProxyAdmin Address:", admin);

  // Check who owns the ProxyAdmin
  const adminAbi = ["function owner() view returns (address)"];
  const adminContract = new ethers.Contract(admin, adminAbi, provider);
  const owner = await adminContract.owner();
  console.log("ProxyAdmin Owner:", owner);

  console.log("-----------------------------------------------");
  console.log("Current Wallet:", (await ethers.getSigners())[0].address);

  if (owner.toLowerCase() === (await ethers.getSigners())[0].address.toLowerCase()) {
    console.log("✅ Current wallet IS the owner. Upgrade should work.");
  } else {
    console.log("❌ Current wallet is NOT the owner.");
    console.log("   You must use the private key for address:", owner);
    console.log("   OR transfer ProxyAdmin ownership to your current wallet.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

