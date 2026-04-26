# Fix Hardhat Private Key Error - TODO

## Problem
Error: `Invalid account: #0 for network: sepolia - private key too short, expected 32 bytes`

## Root Causes
- PRIVATE_KEY in test/.env may have quotes, whitespace, or missing 0x prefix
- hardhat.config.js loads .env from test/.env but README says project root
- No validation or sanitization of the private key before use

## Steps
- [x] Update hardhat.config.js to sanitize and validate PRIVATE_KEY
- [x] Update README.md to clarify correct .env file location
- [x] Test the fix by verifying config loads correctly

