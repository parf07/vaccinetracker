// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sensor from './pages/Sensor';
import Audit from './pages/Audit';
import './App.css';

function App() {
  const [account, setAccount] = useState('Not Connected');

  // THE CLICK FUNCTION
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected connection");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <Router>
      {/* Pass the function and the account to the Layout */}
      <Layout account={account} onConnect={connectWallet}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensor" element={<Sensor setAccount={setAccount} />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;