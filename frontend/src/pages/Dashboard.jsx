// Dashboard.jsx - Redesigned layout & color system (logic unchanged)
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x2AA50fe7eaaA53AE7422e3A451F916D6576D3d00";
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/cnY6zVftvxm_lerRCmQT-";
const ABI = ["function shipmentTemperatures(uint256) public view returns (uint256)"];

/* ── inline styles (no external CSS classes needed) ─────────────── */
const S = {
  page: {
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: '#1a132b',
    minHeight: '100vh',
    color: '#e2dfd8',
    padding: '0',
  },

  /* ── top bar ── */
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    borderBottom: '1px solid #372554',
    background: '#170f28',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  topbarTag: {
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#9a8fb8',
  },
  shipId: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    color: '#f5a623',
    background: 'rgba(245,166,35,0.1)',
    padding: '3px 10px',
    borderRadius: '3px',
    border: '1px solid rgba(245,166,35,0.25)',
  },
  refreshBadge: {
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: '#3a8c72',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  refreshDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#1db87a',
    animation: 'pulse 2s infinite',
  },

  /* ── main grid ── */
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gridTemplateRows: 'auto auto',
    gap: '1px',
    background: '#2b1e45',
  },

  /* ── hero panel (left) ── */
  hero: {
    background: '#1a132b',
    padding: '40px 44px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  heroLabel: {
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#9a8fb8',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  heroLabelLine: {
    flex: 1,
    height: '1px',
    background: '#372554',
  },

  /* ── gauge ring ── */
  gaugeWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap',
  },
  gaugeOuter: {
    position: 'relative',
    width: '200px',
    height: '200px',
    flexShrink: 0,
  },
  gaugeCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
  },
  tempNum: {
    fontSize: '52px',
    fontWeight: '700',
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  tempUnit: {
    fontSize: '13px',
    color: '#a897c7',
    letterSpacing: '0.1em',
  },

  /* ── status pill ── */
  statusRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    minWidth: '200px',
  },
  statusPill: (color, bg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    borderRadius: '4px',
    border: `1px solid ${color}40`,
    background: bg,
    color: color,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    width: 'fit-content',
  }),
  statusMsg: {
    fontSize: '13px',
    color: '#b8add3',
    lineHeight: 1.7,
    maxWidth: '340px',
  },
  auditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #f5a623',
    color: '#f5a623',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  /* ── threshold bar ── */
  threshWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  threshLabel: {
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#9a8fb8',
  },
  threshBar: {
    height: '6px',
    borderRadius: '3px',
    background: '#372554',
    overflow: 'hidden',
    position: 'relative',
  },
  threshFill: (pct, color) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${pct}%`,
    background: color,
    borderRadius: '3px',
    transition: 'width 0.6s ease',
  }),
  threshScale: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#7d6a9f',
    letterSpacing: '0.08em',
    marginTop: '4px',
  },

  /* ── sidebar ── */
  sidebar: {
    background: '#170f28',
    borderLeft: '1px solid #2b1e45',
    display: 'flex',
    flexDirection: 'column',
  },
  sideSection: {
    padding: '22px 20px',
    borderBottom: '1px solid #2b1e45',
  },
  sideSectionTitle: {
    fontSize: '9px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#7d6a9f',
    marginBottom: '14px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '7px 0',
    borderBottom: '1px solid #211436',
    fontSize: '12px',
  },
  metaKey: {
    color: '#9a8fb8',
    letterSpacing: '0.04em',
  },
  metaVal: {
    color: '#dfd4f8',
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: '160px',
    wordBreak: 'break-all',
    fontSize: '11px',
  },

  /* ── security block ── */
  secBlock: {
    padding: '22px 20px',
    flex: 1,
  },
  secTitle: {
    fontSize: '9px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#7d6a9f',
    marginBottom: '14px',
  },
  secBody: {
    fontSize: '12px',
    color: '#9a8fb8',
    lineHeight: 1.7,
  },
  codeChip: {
    display: 'block',
    marginTop: '12px',
    padding: '10px 12px',
    background: '#1a132b',
    border: '1px solid #372554',
    borderLeft: '2px solid #8b5cf6',
    borderRadius: '3px',
    fontSize: '11px',
    color: '#c4b5fd',
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },

  /* ── legend row (bottom) ── */
  legendRow: {
    gridColumn: '1 / -1',
    background: '#170f28',
    borderTop: '1px solid #2b1e45',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    padding: '12px 44px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#9a8fb8',
    letterSpacing: '0.04em',
  },
  legendSwatch: (color) => ({
    width: '20px',
    height: '4px',
    background: color,
    borderRadius: '2px',
  }),

  /* ── error banner ── */
  error: {
    gridColumn: '1 / -1',
    background: 'rgba(224,75,74,0.07)',
    border: '1px solid rgba(224,75,74,0.2)',
    borderRadius: '4px',
    margin: '16px 28px',
    padding: '12px 16px',
    fontSize: '12px',
    color: '#e04b4a',
    letterSpacing: '0.04em',
  },
};

/* ── Arc SVG gauge ──────────────────────────────────────────────── */
function ArcGauge({ value, max = 50, color }) {
  const r = 88;
  const cx = 100;
  const cy = 100;
  const startAngle = -220;
  const totalAngle = 260;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const pct = Math.min(1, Math.max(0, value / max));

  const arcPath = (angleDeg) => {
    const a = toRad(startAngle + angleDeg);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  };

  const describeArc = (endAngle) => {
    const start = arcPath(0);
    const end = arcPath(endAngle);
    const largeArc = endAngle > 180 ? 1 : 0;
    return `M ${start} A ${r} ${r} 0 ${largeArc} 1 ${end}`;
  };

  const filledAngle = pct * totalAngle;

  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      {/* track */}
      <path
        d={describeArc(totalAngle - 0.01)}
        fill="none"
        stroke="#372554"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* filled arc */}
      {filledAngle > 0 && (
        <path
          d={describeArc(filledAngle)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }}
        />
      )}
      {/* tick marks at 25 and 39 */}
      {[25, 39].map((v) => {
        const a = toRad(startAngle + (v / max) * totalAngle);
        const x1 = cx + (r - 14) * Math.cos(a);
        const y1 = cy + (r - 14) * Math.sin(a);
        const x2 = cx + (r + 4) * Math.cos(a);
        const y2 = cy + (r + 4) * Math.sin(a);
        return (
          <line
            key={v}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#7d6a9f"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
const Dashboard = () => {
  const [temp, setTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchBlockchainData = async () => {
    try {
      setError(null);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const currentTemp = await contract.shipmentTemperatures(1);
      setTemp(Number(currentTemp));
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch temperature data. Please check your connection.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (t) => {
    if (t === null) return { label: "LOADING", color: "#5a6070", bg: "rgba(90,96,112,0.08)", icon: "···", message: "Fetching latest data from chain..." };
    if (t > 39) return { label: "CRITICAL BREACH", color: "#e04b4a", bg: "rgba(224,75,74,0.08)", icon: "!", message: "Immediate action required. Temperature exceeds safety limits. Data reverted at contract level." };
    if (t > 25) return { label: "MODERATE WARNING", color: "#f5a623", bg: "rgba(245,166,35,0.08)", icon: "▲", message: "Temperature approaching threshold. Review sensor calibration." };
    return { label: "OPTIMAL", color: "#1db87a", bg: "rgba(29,184,122,0.08)", icon: "✓", message: "Optimal cold chain maintained. All parameters within safe range." };
  };

  const getColor = (t) => {
    if (t === null) return "#5a6070";
    if (t > 39) return "#e04b4a";
    if (t > 25) return "#f5a623";
    return "#1db87a";
  };

  const safeTemp = temp !== null ? temp : 0;
  const status = getStatus(temp);
  const tempColor = getColor(temp);

  const formatTime = () => {
    if (!lastUpdated) return '—';
    return lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={S.page}>

      {/* ── top bar ── */}
      <div style={S.topbar}>
        <div style={S.topbarLeft}>
          <span style={S.topbarTag}>Shipment Monitor</span>
          <span style={S.shipId}>ID #1</span>
        </div>
        <div style={S.refreshBadge}>
          <div style={S.refreshDot} />
          <span>Live · refresh every 10s</span>
        </div>
      </div>

      {/* ── main grid ── */}
      <div style={S.grid}>

        {/* ── HERO (left) ── */}
        <div style={S.hero}>

          <div style={S.heroLabel}>
            <span>Temperature Reading</span>
            <div style={S.heroLabelLine} />
          </div>

          {/* gauge + status */}
          <div style={S.gaugeWrap}>
            <div style={S.gaugeOuter}>
              <ArcGauge value={safeTemp} max={50} color={tempColor} />
              <div style={S.gaugeCenter}>
                <span style={{ ...S.tempNum, color: tempColor }}>
                  {isLoading ? '—' : safeTemp}
                </span>
                <span style={S.tempUnit}>°C</span>
              </div>
            </div>

            <div style={S.statusRow}>
              <div style={S.statusPill(status.color, status.bg)}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>
              <p style={S.statusMsg}>{status.message}</p>
              {temp !== null && temp > 25 && (
                <button
                  style={S.auditBtn}
                  onClick={() => window.location.href = '/audit'}
                >
                  View Security Audit →
                </button>
              )}
            </div>
          </div>

          {/* threshold bar */}
          <div style={S.threshWrap}>
            <span style={S.threshLabel}>Threshold Indicator — 0 to 50°C</span>
            <div style={S.threshBar}>
              {/* zones */}
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '50%', background: '#1db87a22' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '28%', background: '#f5a62322' }} />
              <div style={{ position: 'absolute', left: '78%', top: 0, height: '100%', width: '22%', background: '#e04b4a22' }} />
              {/* fill */}
              <div style={S.threshFill(Math.min(100, (safeTemp / 50) * 100), tempColor)} />
            </div>
            <div style={S.threshScale}>
              <span>0°</span>
              <span>25°</span>
              <span>39°</span>
              <span>50°</span>
            </div>
          </div>

        </div>

        {/* ── SIDEBAR (right) ── */}
        <div style={S.sidebar}>

          {/* chain data */}
          <div style={S.sideSection}>
            <div style={S.sideSectionTitle}>Chain Data</div>
            {[
              ['Contract', `${CONTRACT_ADDRESS.slice(0, 10)}…${CONTRACT_ADDRESS.slice(-6)}`],
              ['Network', 'Sepolia Testnet'],
              ['Shipment ID', '#1'],
              ['Last Updated', formatTime()],
              ['RPC', 'Alchemy · eth-sepolia'],
            ].map(([k, v]) => (
              <div key={k} style={S.metaRow}>
                <span style={S.metaKey}>{k}</span>
                <span style={S.metaVal}>{v}</span>
              </div>
            ))}
          </div>

          {/* security */}
          <div style={S.secBlock}>
            <div style={S.secTitle}>Smart Contract Guard</div>
            <p style={S.secBody}>
              Immutable blockchain record. Once accepted or rejected, data cannot be altered by any party.
            </p>
            <code style={S.codeChip}>
              require(temp &le; 25,{'\n'}
              "Exceeds safety threshold!")
            </code>
          </div>

        </div>

        {/* ── LEGEND (bottom, full-width) ── */}
        <div style={S.legendRow}>
          {[
            { color: '#1db87a', label: '0–25°C · Optimal' },
            { color: '#f5a623', label: '26–39°C · Moderate Warning' },
            { color: '#e04b4a', label: '>39°C · Critical Breach' },
          ].map(({ color, label }) => (
            <div key={label} style={S.legendItem}>
              <div style={S.legendSwatch(color)} />
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── error ── */}
      {error && (
        <div style={S.error}>⚠ {error}</div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
};

export default Dashboard;
