const { ethers, upgrades } = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00";

  console.log("==================================");
  console.log("ShipmentTracker V2 Upgrade");
  console.log("Proxy:", PROXY_ADDRESS);
  console.log("==================================");

  const ShipmentTrackerV2 = await ethers.getContractFactory("ShipmentTrackerV2");

  console.log("Upgrading proxy...");

  const upgraded = await upgrades.upgradeProxy(
    PROXY_ADDRESS,
    ShipmentTrackerV2
  );

  // ✅ FIX: ethers v5 uses .address (NOT getAddress)
  const proxyAddress = upgraded.address;

  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("==================================");
  console.log("✅ UPGRADE SUCCESSFUL");
  console.log("Proxy:", proxyAddress);
  console.log("Implementation:", implAddress);
  console.log("==================================");
}

main().catch((error) => {
  console.error("❌ Upgrade failed:", error);
  process.exitCode = 1;
});