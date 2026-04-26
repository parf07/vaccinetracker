# Vaccine Shipment Tracker (Transparent Proxy)

A full-stack decentralized application for tracking vaccine shipment temperatures using an upgradeable smart contract (OpenZeppelin Transparent Proxy) on the Sepolia testnet. The project includes a React frontend, Hardhat development environment, and a Prometheus/Grafana monitoring stack.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Smart Contracts](#smart-contracts)
  - [Compile](#compile)
  - [Test](#test)
  - [Local Deployment](#local-deployment)
  - [Sepolia Deployment](#sepolia-deployment)
  - [Upgrade to V2](#upgrade-to-v2)
- [Frontend](#frontend)
- [Monitoring](#monitoring)
- [Deployed Contracts](#deployed-contracts)
- [Troubleshooting](#troubleshooting)

## Overview

- **Smart Contract (V1):** `ShipmentTracker` tracks shipment temperatures and reverts transactions if the temperature exceeds a configurable threshold.
- **Smart Contract (V2):** `ShipmentTrackerV2` upgrades the logic to enforce a hardcoded maximum threshold of 39°C.
- **Proxy Pattern:** Uses OpenZeppelin's Transparent Proxy to allow upgrading the implementation contract without changing the proxy address.
- **Frontend:** A React + Vite application to interact with the deployed contract.
- **Monitoring:** A Node.js Prometheus exporter polls the Sepolia blockchain for temperature data, visualized via Grafana.

## Project Structure

```
.
├── contracts/                  # Solidity smart contracts
│   ├── ShipmentTracker.sol     # V1 Implementation
│   └── ShipmentTrackerV2.sol   # V2 Implementation
├── scripts/
│   ├── deploy.js               # Deploy V1 proxy to Sepolia
│   └── upgrade_to_v2.js        # Upgrade proxy to V2
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sensor.jsx
│   │   │   └── Audit.jsx
│   │   └── components/
│   │       └── Layout.jsx
│   └── package.json
├── monitoring/                 # Prometheus & Grafana stack
│   ├── docker-compose.yml
│   ├── prometheus.yml
│   ├── exporter.js             # Node.js blockchain metrics exporter
│   └── package.json
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Root project dependencies
└── address-deployment.json     # Auto-generated deployment addresses
```

## Prerequisites

- **Node.js** (v18 or later)
- **npm**
- **Git**
- **Docker & Docker Compose** (for monitoring stack)
- **MetaMask** or another Web3 wallet with Sepolia ETH
- **Alchemy Account** (for Sepolia RPC endpoint)

## Installation

### 1. Clone and Install Root Dependencies

```bash
# In the project root directory
npm nstall
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Install Monitoring Dependencies

```bash
cd monitoring
npm install
cd ..
```

## Environment Variables

Create a `.env` file in the **`test/` directory** with the following variables:

```env
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
```

**⚠️ Security Warning:** Never commit your `.env` file or private key to version control.

## Smart Contracts

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Local Deployment

Start a local Hardhat node in one terminal:

```bash
npx hardhat node
```

In another terminal, run the local deployment script:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Deployment

To deploy the V1 contract to the Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This will:

- Deploy the `ShipmentTracker` implementation contract.
- Deploy the Transparent Proxy.
- Automatically generate/update `address-deployment.json` with the proxy and implementation addresses.

### Upgrade to V2

After V1 is deployed, upgrade the proxy to `ShipmentTrackerV2`:

1. Open `scripts/upgrade_to_v2.js`.
2. Ensure the `PROXY_ADDRESS` variable matches the proxy address from `address-deployment.json`.
3. Run the upgrade script:

```bash
npx hardhat run scripts/upgrade_to_v2.js --network sepolia
```

## Frontend

### Development Mode

Navigate to the frontend directory and start the dev server:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
cd frontend
npm run build
```

### Preview Production Build

```bash
cd frontend
npm run preview
```

## Monitoring

The monitoring stack consists of a custom blockchain exporter, Prometheus, and Grafana.

### 1. Start the Blockchain Exporter

The exporter fetches shipment temperature data from Sepolia and exposes it as Prometheus metrics.

```bash
cd monitoring
npm start
```

The exporter will be available at `http://localhost:9000/metrics`.

### 2. Start Prometheus & Grafana

Ensure Docker is running, then execute:

```bash
cd monitoring
docker-compose up -d
```

This launches:

- **Prometheus** at `http://localhost:9090`
- **Grafana** at `http://localhost:3000`
  - Default login: `admin` / `admin`

### 3. Configure Grafana

1. Open Grafana (`http://localhost:3000`).
2. Add Prometheus as a data source (URL: `http://prometheus:9090`).
3. Create a dashboard using the metric name `shipment_temperature_celsius`.

## Deployed Contracts

Current deployment on **Sepolia Testnet**:

| Contract                                | Address                                      |
| :-------------------------------------- | :------------------------------------------- |
| **ShipmentTracker Proxy**               | `0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00` |
| **ShipmentTracker Implementation (V1)** | `0x0b97F9364D4947A6d0654779382F690ea54E23C9` |

_(See `address-deployment.json` for the latest auto-generated details.)_

## Troubleshooting

- **Provider Errors / "Filter not found":** The Sepolia RPC can be unstable. The monitoring exporter includes automatic reconnection logic. If the frontend fails to load data, check your network connection or try reloading the page.
- **Transaction Reverted (V1):** Ensure the temperature value you submit is below the currently set `temperatureThreshold`.
- **Transaction Reverted (V2):** Ensure the temperature value is **39°C or below**.
- **Docker Issues:** If Prometheus cannot scrape the exporter, verify that the exporter is running on port `9000` and that Docker has access to `host.docker.internal` (check `monitoring/docker-compose.yml` for the `extra_hosts` configuration).
