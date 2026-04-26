// const { ethers } = require("ethers");
// const client = require("prom-client");
// const express = require("express");

// // 1. Prometheus Metrics Configuration
// const registry = new client.Registry();
// const tempGauge = new client.Gauge({
//   name: 'shipment_temperature_celsius',
//   help: 'Current temperature of the tracked vaccine shipment',
//   registers: [registry],
// });

// // 2. Network & Contract Constants
// const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/43BB0KpCnJSqwnBmX4EkO";
// const CONTRACT_ADDRESS = "0x33F4a2E02975Fe83516d122F4DA807f71836aAA8";

// const abi = [
//   "event TemperatureUpdated(uint256 indexed shipmentId, uint256 temp)",
//   "function shipmentTemperatures(uint256) public view returns (uint256)"
// ];

// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// // 3. Sync Logic (The "Read" operation)
// async function syncData() {
//   try {
//     // We assume Shipment ID 1 as per your UI
//     const currentOnChainTemp = await contract.shipmentTemperatures(1);
//     console.log(`[${new Date().toLocaleTimeString()}] SYNC: Current Temp is ${currentOnChainTemp}°C`);
//     tempGauge.set(Number(currentOnChainTemp));
//   } catch (err) {
//     console.error("[ERROR] Sync failed:", err.message);
//   }
// }

// // 4. Automatic Monitoring with Error Recovery
// async function startMonitoring() {
//   console.log("--- Cold Chain Monitor Initialized ---");

//   // A. Initial Data Fetch
//   await syncData();

//   // B. Self-Healing Listener Function
//   const setupEventListener = () => {
//     console.log("Setting up blockchain event listener...");
    
//     // Listen for the event emitted by your smart contract
//     contract.on("TemperatureUpdated", (shipmentId, temp) => {
//       console.log(`🚀 LIVE UPDATE: Shipment #${shipmentId} changed to ${temp}°C`);
//       tempGauge.set(Number(temp));
//     });

//     // Handle the "filter not found" or "connection lost" errors automatically
//     provider.on("error", (error) => {
//       console.warn("⚠️ Provider error detected. Attempting to reconnect...", error.reason);
//       contract.removeAllListeners(); 
//       setTimeout(setupEventListener, 1000); // Reconnect after 5 seconds
//     });
//   };

//   setupEventListener();

//   // C. Heartbeat Polling (Fallback)
//   // Even if the listener fails, this ensures the data updates every 30s
//   setInterval(async () => {
//     await syncData();
//   }, 30000); 
// }

// // 5. Express Metrics Server
// const app = express();

// app.get("/metrics", async (req, res) => {
//   res.set("Content-Type", registry.contentType);
//   res.send(await registry.metrics());
// });

// // Bind to 0.0.0.0 so the Docker container can reach it
// const PORT = 9000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Exporter is live at http://localhost:${PORT}/metrics`);
//   startMonitoring();
// });



const { ethers } = require("ethers");
const client = require("prom-client");
const express = require("express");

// 1. Prometheus Metrics Setup
const registry = new client.Registry();
const tempGauge = new client.Gauge({
  name: 'shipment_temperature_celsius',
  help: 'Current temperature of the tracked vaccine shipment',
  registers: [registry],
});

// 2. Network & Contract Configuration
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/43BB0KpCnJSqwnBmX4EkO";
const CONTRACT_ADDRESS = "0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00";

// We only need the read function for state polling
const abi = [
  "function shipmentTemperatures(uint256) public view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// 3. The Monitoring Engine
async function fetchBlockchainData() {
  try {
    // We target Shipment ID 1 as defined in your Smart Contract/UI
    const currentTemp = await contract.shipmentTemperatures(1);
    
    // Update the Prometheus metric
    tempGauge.set(Number(currentTemp));
    
    console.log(`[${new Date().toLocaleTimeString()}] ✅ MONITORING: Temperature is ${currentTemp}°C`);
  } catch (err) {
    // Logs the error but keeps the script running
    console.error(`[${new Date().toLocaleTimeString()}] ⚠️ RPC Delay: ${err.shortMessage || "Network busy"}`);
  }
}

// 4. Automation Strategy
async function start() {
  console.log("--- Vaccine Cold Chain Monitor: ONLINE ---");
  console.log(`Watching Contract: ${CONTRACT_ADDRESS}`);

  // Fetch immediately on startup
  await fetchBlockchainData();

  // Polling Interval: 10 seconds
  // Since Sepolia blocks take ~12-15s, 10s polling is effectively real-time.
  setInterval(fetchBlockchainData, 10000); 
}

// 5. Metrics Endpoint for Prometheus
const app = express();
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

const PORT = 9000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Exporter serving metrics at http://localhost:${PORT}/metrics`);
  start();
});