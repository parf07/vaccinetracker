require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "test", ".env") });

const networks = {};

if (process.env.ALCHEMY_SEPOLIA_URL && process.env.PRIVATE_KEY) {
  // Sanitize PRIVATE_KEY: trim whitespace and remove surrounding quotes
  let privateKey = process.env.PRIVATE_KEY.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  // Ensure 0x prefix is present
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }

  // Validate key length (32 bytes = 64 hex chars + 0x prefix = 66 chars total)
  if (privateKey.length !== 66) {
    throw new Error(
      `Invalid PRIVATE_KEY length: expected 66 characters (including 0x prefix), but got ${privateKey.length}. ` +
      `Please check your test/.env file and ensure the private key is a valid 32-byte hex string.`
    );
  }

  networks.sepolia = {
    url: process.env.ALCHEMY_SEPOLIA_URL,
    accounts: [privateKey],
  };
}

// Ensure sepolia is always defined for hardhat even if env vars are missing
if (!networks.sepolia) {
  console.warn("Warning: Sepolia network not configured. Please set ALCHEMY_SEPOLIA_URL and PRIVATE_KEY in test/.env");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks,
};
