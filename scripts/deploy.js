const { ethers, upgrades } = require("hardhat");
const fs = require("fs"); // Node.js File System module

async function main() {
  const threshold = 25; 
  console.log("Starting deployment of ShipmentTracker on Sepolia...");

  const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");

  const proxy = await upgrades.deployProxy(ShipmentTracker, [threshold], {
    initializer: "initialize",
  });

  await proxy.deployed();

  const proxyAddress = proxy.address;
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  // --- AUTO-FILE CREATION LOGIC ---
  const deploymentData = {
    network: "sepolia",
    shipmentTrackerProxy: proxyAddress,
    shipmentTrackerImplementation: implementationAddress,
    deploymentDate: new Date().toISOString(),
    contractName: "ShipmentTracker"
  };

  // Write the file to your project root
  fs.writeFileSync(
    "address-deployment.json", 
    JSON.stringify(deploymentData, null, 2)
  );
  // --------------------------------

  console.log("-----------------------------------------------");
  console.log("Proxy Address:", proxyAddress);
  console.log("Implementation Address:", implementationAddress);
  console.log("FILE CREATED: address-deployment.json");
  console.log("-----------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});