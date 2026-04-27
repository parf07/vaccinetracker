// Sensor.jsx - Enhanced with form validation and transaction handling
import React, { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00";
const ABI = [
  "function updateStatus(uint256 shipmentId, uint256 temp) public",
  "function shipmentTemperatures(uint256) public view returns (uint256)"
];

const Sensor = ({ setAccount }) => {
  const [tempInput, setTempInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('idle'); // idle, pending, success, error

  const validateTemperature = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, message: 'Please enter a valid number' };
    if (num < -50) return { valid: false, message: 'Temperature below -50°C is not realistic' };
    if (num > 100) return { valid: false, message: 'Temperature above 100°C is not realistic' };
    return { valid: true, value: num };
  };

  const getTemperatureAdvice = (value) => {
    const validation = validateTemperature(value);
    if (!validation.valid) return { message: validation.message, type: 'error' };
    const num = validation.value;
    if (num > 25) return { message: '⚠️ This will FAIL - exceeds 25°C safety threshold (good for Tenderly trace)', type: 'warning' };
    if (num > 20) return { message: '✅ Safe range - transaction will succeed', type: 'success' };
    if (num > 0) return { message: '✅ Optimal cold chain temperature', type: 'success' };
    return { message: 'ℹ️ Temperature is within acceptable range', type: 'info' };
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    setSuccess(false);
    setTransactionStatus('pending');

    const validation = validateTemperature(tempInput);
    if (!validation.valid) {
      setError(validation.message);
      setTransactionStatus('error');
      return;
    }

    if (!window.ethereum) {
      setError("Please install MetaMask to update the blockchain.");
      setTransactionStatus('error');
      return;
    }

    try {
      setLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.updateStatus(1, tempInput);
      setTxHash(tx.hash);
      setTransactionStatus('pending');
      
      await tx.wait();
      setSuccess(true);
      setTransactionStatus('success');
      setLoading(false);
      setTempInput('');
      
      setTimeout(() => {
        setSuccess(false);
        setTransactionStatus('idle');
      }, 5000);

    } catch (err) {
      setLoading(false);
      console.error(err);
      setTransactionStatus('error');
      
      const tempValue = parseFloat(tempInput);
      if (tempValue > 25) {
        setError(`🚨 Transaction Rejected: Temperature exceeds safety threshold (25°C). 
                  This failed transaction can be traced in Tenderly for forensic debugging. 
                  
                  Error details: ${err.message || 'Contract revert - require condition failed'}`);
      } else {
        setError(`Transaction failed: ${err.message || 'Unknown error occurred'}`);
      }
    }
  };

  const advice = tempInput ? getTemperatureAdvice(tempInput) : null;
  const adviceClass = advice ? `sensor-advice ${advice.type}` : 'sensor-advice';
  const inputClass = `input-field sensor-input ${
    advice?.type === 'warning' ? 'warning' : advice?.type === 'success' ? 'success' : ''
  }`;

  return (
    <div className="sensor-page">
      <div className="page-title">
        Sensor Command Console
      </div>

      <div className="sensor-layout-grid">
        <section className="card sensor-hero-card">
          <div className="sensor-hero-header">
            <h3 className="card-title">Dispatch Temperature Update</h3>
            <span className="badge-success">Shipment #1</span>
          </div>

          <p className="sensor-intro-text">
            Simulate an IoT update by sending a signed transaction to the smart contract. Every submission is immutable and auditable on-chain.
          </p>

          <form onSubmit={handleUpdate} className="sensor-form">
            <div className="input-group">
              <label className="input-label">Temperature Input (°C)</label>
              <div className="sensor-input-wrap">
                <input
                  type="number"
                  step="0.1"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  placeholder="E.15"
                  className={inputClass}
                  required
                  disabled={loading}
                />
                <span className="sensor-unit-pill">Celsius</span>
              </div>
              {advice && <p className={adviceClass}>{advice.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary sensor-submit-btn">
              {loading ? 'Processing Transaction...' : 'Submit To Blockchain'}
            </button>
          </form>

          {transactionStatus === 'pending' && !success && !error && (
            <div className="sensor-status-banner pending">
              <p>Transaction submitted. Waiting for confirmation...</p>
              {txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                  View on Etherscan
                </a>
              )}
            </div>
          )}

          {success && (
            <div className="sensor-status-banner success">
              <p>Blockchain updated successfully.</p>
              {txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                  View transaction details
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="sensor-status-banner error">
              <p>{error}</p>
              {error.includes('exceeds safety threshold') && (
                <button className="btn-secondary sensor-trace-btn" onClick={() => window.open('https://dashboard.tenderly.co/', '_blank')}>
                  Open Tenderly Trace
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="card sensor-side-card">
          <h4 className="sensor-side-title">Operating Rules</h4>
          <div className="sensor-rule-list">
            <div className="sensor-rule-item success">
              <span>Safe Zone</span>
              <p>15°C - 25°C values are accepted and written on-chain.</p>
            </div>
            <div className="sensor-rule-item danger">
              <span>Rejection Zone</span>
              <p>Values above 25°C revert for compliance enforcement.</p>
            </div>
            <div className="sensor-rule-item info">
              <span>Audit Trail</span>
              <p>Rejected transactions are ideal for Tenderly forensic analysis.</p>
            </div>
          </div>
          {window.ethereum && (
            <div className="sensor-wallet-status">
              MetaMask detected. Network: {window.ethereum.networkVersion === '11155111' ? 'Sepolia' : 'Switch to Sepolia'}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Sensor;