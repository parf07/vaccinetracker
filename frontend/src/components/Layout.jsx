// Layout.jsx - Enhanced with white/green theme, better sidebar, and wallet integration
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, account, onConnect }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', description: 'Live temperature monitoring' },
    { path: '/sensor', label: 'Sensor Control', icon: '🌡️', description: 'Submit temperature readings' },
    { path: '/audit', label: 'Audit & Security', icon: '🛡️', description: 'Security reports & analysis' }
  ];

  const getWalletDisplay = () => {
    if (account === 'Not Connected') {
      return (
        <>
          <span className="wallet-icon">🔌</span>
          <span>Connect Wallet</span>
        </>
      );
    }
    return (
      <>
        <span className="wallet-icon connected">✅</span>
        <span className="wallet-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
        <span className="wallet-badge">Connected</span>
      </>
    );
  };

  return (
    <div className="layout-shell">
      <header className="app-header">
        <div className="header-top">
          <div className="brand-block">
            <div className="logo-icon">VC</div>
            <div className="logo-content">
              <h1 className="logo-text">VACCINE TRACKER FOR  KACYIRU HOSPITAL</h1>
              <span className="logo-subtitle">Kacyiru Hospital Blockchain Monitoring</span>
            </div>
          </div>

          <div className="header-controls">
            <div className="network-indicator">
              <span className="network-dot"></span>
              <span className="network-name">Sepolia</span>
              <span className="network-status">Live</span>
            </div>

            <button
              className={`wallet-connect-btn ${account !== 'Not Connected' ? 'connected' : ''}`}
              onClick={onConnect}
            >
              {getWalletDisplay()}
            </button>
          </div>
        </div>

        <nav className="header-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`header-nav-link ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="main-content-area">
        <div className="content-wrapper">{children}</div>
      </main>

      <footer className="app-footer">
        <div className="footer-section">
          <span className="footer-icon">🔒</span>
          <span>Blockchain Secured</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">⚡</span>
          <span>Live Sensor Sync</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">🧪</span>
          <span>Cold-Chain Compliance</span>
        </div>
        <div className="footer-section">
          <span className="footer-icon">🛡️</span>
          <span>Audited Smart Contract</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;