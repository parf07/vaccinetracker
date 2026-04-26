# Vaccine Shipment Tracker — Project Report

**Generated:** 2026-04-26
**Project:** Transparent Proxy Smart Contract for Vaccine Cold-Chain Monitoring
**Network:** Ethereum Sepolia Testnet

---

## 1. Executive Summary

This project implements an upgradeable `ShipmentTracker` smart contract using OpenZeppelin's Transparent Proxy pattern. It tracks vaccine shipment temperatures on-chain, reverting transactions that exceed safety thresholds. The system includes a React+Vite frontend, Hardhat development environment, and a Prometheus/Grafana monitoring stack.

---

## 2. Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend│────▶│  Sepolia RPC     │────▶│Transparent Proxy│
│  (Dashboard /   │     │  (Alchemy)       │     │  (UUPS Pattern) │
│   Sensor /Audit)│◄────│                  │◄────│                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                           ┌──────────────────────────────┘
                           ▼
                    ┌─────────────┐
                    │ ShipmentTracker│  (V1 or V2 Implementation)
                    │  (Logic)    │
                    └─────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Node.js        │────▶│  Prometheus      │────▶│     Grafana     │
│  Exporter       │     │  (Metrics DB)    │     │  (Dashboards)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| Smart Contract | Solidity 0.8.20 | Core business logic for temperature validation |
| Proxy Pattern | OpenZeppelin Transparent Proxy | Upgradeability without address changes |
| Frontend | React 18 + Vite | User interface for monitoring and sensor input |
| Monitoring | Node.js + prom-client + express | Blockchain metrics exporter |
| DevOps | Docker Compose | Prometheus & Grafana orchestration |

---

## 3. Smart Contract Analysis

### 3.1 ShipmentTracker (V1)

**File:** `contracts/ShipmentTracker.sol`

- **Pattern:** Initializable + OwnableUpgradeable (OpenZeppelin)
- **Threshold:** Configurable at deployment/upgrade time (default: 25°C)
- **Key Function:** `updateStatus(uint256 _shipmentId, uint256 _currentTemp)`
  - Reverts with `"Temperature breach: Vaccine safety threshold exceeded"` if `_currentTemp > temperatureThreshold`
  - Emits `TemperatureAlert(uint256 indexed shipmentId, uint256 temperature)` on breach
  - Stores valid temperatures in `shipmentTemperatures` mapping
- **Owner Function:** `setThreshold(uint256 _newThreshold)` allows owner to adjust threshold post-deployment

### 3.2 ShipmentTrackerV2 (V2)

**File:** `contracts/ShipmentTrackerV2.sol`

- **Upgrade Logic:** Hardcodes maximum temperature to **39°C**
- **Issue:** The contract retains `temperatureThreshold` state variable and `initialize()` sets it, but `updateStatus()` completely ignores the stored value in favor of the hardcoded `39` check.
  - This creates a mismatch where the owner could call `setThreshold()` (if it existed in V2) but the logic would still enforce 39°C.
  - **Impact:** Medium — the stored threshold becomes dead state, consuming gas for SSTORE during initialization with no runtime effect.

### 3.3 Deployment Status

**Current Deployment (from `address-deployment.json`):**

| Contract | Address | Network |
|----------|---------|---------|
| **Proxy** | `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` | Sepolia |
| **Implementation (V1)** | `0x0b2DC81d5F9B3e010e0508de3a6b18A92585F68b` | Sepolia |
| **Deployment Date** | 2026-04-25T18:21:05.022Z | — |

---

## 4. Frontend Analysis

### 4.1 Dashboard (`frontend/src/pages/Dashboard.jsx`)

- **Contract Address Used:** `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` ✅ (matches deployment)
- **RPC URL:** Alchemy Sepolia endpoint (partial key visible in source)
- **Polling Interval:** 10 seconds
- **UI Features:**
  - Real-time temperature display with color-coded status
  - Temperature bar visualizer (scales to 50°C max)
  - Status badges: OPTIMAL / MODERATE WARNING / CRITICAL BREACH
  - Auto-refresh timestamp
  - Error handling for RPC failures

### 4.2 Sensor (`frontend/src/pages/Sensor.jsx`)

- **Contract Address Used:** `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` ✅ (matches deployment)
- **Wallet Integration:** MetaMask via `window.ethereum`
- **Validation:**
  - Client-side: -50°C to 100°C realistic range
  - Warning for >25°C (anticipates V1 revert)
- **Transaction Feedback:**
  - Etherscan Sepolia link generation
  - Tenderly trace prompt for failed transactions
  - Success/error state management with timeout reset

### 4.3 Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| `setAccount` prop | Low | `Sensor` accepts `setAccount` but `App.jsx` integration not verified in this report |

---

## 5. Monitoring Stack Analysis

### 5.1 Exporter (`monitoring/exporter.js`)

- **Contract Address Used:** `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` ✅ (matches deployment)
- **Metric:** `shipment_temperature_celsius` (Gauge)
- **Polling Interval:** 10 seconds
- **Port:** `9000` (binds to `0.0.0.0` for Docker accessibility)
- **Event Listener:** The commented-out event listener code shows an earlier iteration with automatic reconnection logic. The current version uses pure polling for stability.

### 5.2 Docker Configuration (`monitoring/docker-compose.yml`)

- Prometheus scrapes exporter at `host.docker.internal:9000`
- Grafana available at port `3000`

---

## 6. Critical Issues & Inconsistencies

### 🔴 HIGH: Proxy Address Mismatch

**Problem:** The README and upgrade script reference a **different proxy address** than the actual deployment.

| Source | Address | Status |
|--------|---------|--------|
| `address-deployment.json` | `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` | ✅ Current |
| `frontend/` + `monitoring/` | `0x09ddF27130119FcC2F538c0A28a146d8886B3De5` | ✅ Current |
| `README.md` Deployed Contracts table | `0x33F4a2E02975Fe83516d122F4DA807f71836aAA8` | ❌ **Stale** |
| `scripts/upgrade_to_v2.js` | `0x33F4a2E02975Fe83516d122F4DA807f71836aAA8` | ❌ **Stale** |

**Impact:** Running `upgrade_to_v2.js` will attempt to upgrade the wrong contract address, potentially failing or interacting with an unrelated/unowned proxy.

**Recommendation:** Update `scripts/upgrade_to_v2.js` and `README.md` to use `0x09ddF27130119FcC2F538c0A28a146d8886B3De5`.

### 🟡 MEDIUM: V2 Logic Ignores Configurable Threshold

**Problem:** `ShipmentTrackerV2.updateStatus()` hardcodes `39` instead of reading `temperatureThreshold`.

**Code:**
```solidity
if (_currentTemp > 39) {  // Hardcoded
    emit TemperatureAlert(_shipmentId, _currentTemp);
    revert("V2: Temperature exceeds NEW threshold (39C)");
}
```

**Impact:** The `initialize()` function's `_threshold` parameter and `temperatureThreshold` state variable serve no purpose in V2. This wastes initialization gas and creates confusion about where the threshold is controlled.

**Recommendation:** Either:
- Option A: Use `temperatureThreshold` in the condition (allows owner adjustment)
- Option B: Remove the parameter from `initialize()` and document that V2 is intentionally fixed at 39°C

### 🟡 MEDIUM: Ethers Version Inconsistency in Scripts

**Problem:** `scripts/deploy.js` uses `await proxy.deployed()` (Ethers v5 syntax). Hardhat Toolbox typically ships with Ethers v6, where the correct call is `await proxy.waitForDeployment()`.

**File:** `scripts/deploy.js:15`
```javascript
await proxy.deployed(); // Ethers v5 — may fail with v6
```

**File:** `scripts/upgrade_to_v2.js` mixes v5 and v6 patterns:
```javascript
if (upgraded.deploymentTransaction) {      // v6 check
    await upgraded.deploymentTransaction().wait();  // v6
} else if (upgraded.deployTransaction) {   // v5 check
    await upgraded.deployTransaction.wait();        // v5
}
```

**Recommendation:** Standardize on Ethers v6 across all scripts. Update `deploy.js` to use `await proxy.waitForDeployment()` and `await proxy.getAddress()`.

### 🟢 LOW: README Typo

**File:** `README.md:45`
```bash
npm nstall  # Should be: npm install
```

### 🟢 LOW: Dotenv Path Configuration

**File:** `hardhat.config.js`
```javascript
require("dotenv").config({ path: path.join(__dirname, "test", ".env") });
```

The `.env` file is expected in `test/.env` rather than the project root. This is unconventional and could cause confusion. The README instructs users to create `.env` in the project root.

**Recommendation:** Change to `path.join(__dirname, ".env")` to match README instructions, or update README to specify `test/.env`.

---

## 7. Security Assessment

| Check | Status | Notes |
|-------|--------|-------|
| No constructor state | ✅ | `_disableInitializers()` used correctly |
| Owner access control | ✅ | `onlyOwner` on threshold updates (V1) |
| Input validation | ✅ | Temperature checked before state update |
| Reentrancy risk | ✅ | No external calls in `updateStatus` |
| Proxy pattern safety | ✅ | OpenZeppelin battle-tested implementation |
| Private key exposure | ⚠️ | `.env` not committed (good), but `test/.env` path mismatch |
| RPC key exposure | ⚠️ | Partial Alchemy keys visible in committed frontend/exporter code |

---

## 8. Recommended Action Items

1. **URGENT:** Update `scripts/upgrade_to_v2.js` PROXY_ADDRESS to `0x09ddF27130119FcC2F538c0A28a146d8886B3De5`
2. **URGENT:** Update `README.md` Deployed Contracts table with correct addresses
3. **MEDIUM:** Fix `deploy.js` Ethers v5 → v6 syntax (`deployed()` → `waitForDeployment()`)
4. **MEDIUM:** Decide on V2 threshold strategy (configurable vs hardcoded) and refactor accordingly
5. **LOW:** Fix `npm nstall` typo in README
6. **LOW:** Align `hardhat.config.js` dotenv path with README instructions
7. **LOW:** Consider moving sensitive RPC URLs to environment variables in frontend/monitoring to avoid key leakage in version control

---

## 9. Testing

**Current Tests:** `test/Lock.js` (Hardhat default sample test)

**Gap:** No custom tests exist for `ShipmentTracker` or `ShipmentTrackerV2`. Recommended additions:
- Threshold boundary tests (exactly 25°C, 25.1°C, 39°C, 39.1°C)
- Proxy upgrade flow test (deploy V1 → upgrade to V2 → verify state persistence)
- Owner-only `setThreshold` test
- `TemperatureAlert` event emission test

---

## 10. Deployment Checklist

| Step | Command | Status |
|------|---------|--------|
| Install dependencies | `npm install` | Required |
| Compile contracts | `npx hardhat compile` | Ready |
| Run tests | `npx hardhat test` | Needs custom tests |
| Deploy to Sepolia | `npx hardhat run scripts/deploy.js --network sepolia` | Already deployed |
| Upgrade to V2 | `npx hardhat run scripts/upgrade_to_v2.js --network sepolia` | **Blocked** (wrong address) |
| Start frontend | `cd frontend && npm run dev` | Ready |
| Start monitoring | `cd monitoring && npm start && docker-compose up -d` | Ready |

---

*End of Report*

