import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function GraphPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { siftedBits = [], qber = null, keyAccepted = null, eveEnabled = false } = location.state || {};

  if (siftedBits.length === 0) {
    return (
      <div className="graph-container">
        <h2 className="graph-title">No data available</h2>
        <button className="graph-button" onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  // Prepare data for Alice and Bob sifted keys
  const positions = siftedBits.map((_, index) => index.toString());
  const aliceData = siftedBits.map((bit) => bit.alice);
  const bobData = siftedBits.map((bit) => bit.bob);

  // Find mismatch positions for special markers
  const mismatches = siftedBits
    .map((bit, index) => (bit.alice !== bit.bob ? index : null))
    .filter(Boolean);

  // Prepare mismatch data: null everywhere except at mismatch positions
  const mismatchData = positions.map((pos, index) => 
    mismatches.includes(index) ? (siftedBits[index].alice || 0) : null
  );

  // Title with eavesdropping/transmission abort logic
  const isEavesdroppingDetected = eveEnabled && qber > 15;
  const titleText = isEavesdroppingDetected
    ? "BB84 Shared Sifted Key Comparison (Eavesdropping Detected, Transmission Aborted)"
    : "BB84 Shared Sifted Key Comparison";

  const data = {
    labels: positions,
    datasets: [
      {
        label: "Alice's sifted key",
        data: aliceData,
        fill: false,
        borderColor: "#a855f7",
        backgroundColor: "#a855f7",
        pointBackgroundColor: "#c084fc",
        pointBorderColor: "rgba(168,85,247,0.4)",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0,
        pointStyle: 'circle',
      },
      {
        label: "Bob's sifted key",
        data: bobData,
        fill: false,
        borderColor: "#34d399",
        backgroundColor: "#34d399",
        pointBackgroundColor: "#34d399",
        pointBorderColor: "rgba(16,185,129,0.4)",
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0,
        pointStyle: 'circle',
      },
      // Mismatch markers (stars at error positions)
      {
        label: "Mismatches (Errors)",
        data: mismatchData,
        fill: false,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        pointBackgroundColor: "#f87171",
        pointBorderColor: "rgba(239,68,68,0.4)",
        pointRadius: mismatches.length > 0 ? 8 : 0,
        pointHoverRadius: 10,
        borderWidth: 0,
        pointStyle: 'star',
        showLine: false,
      },
    ],
  };

  // Custom plugin for red shading if eavesdropping detected
  const abortPlugin = {
    id: 'abortShading',
    afterDraw: (chart) => {
      if (isEavesdroppingDetected) {
        const { ctx, width, height } = chart;
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    },
  };

  // Register the custom plugin
  ChartJS.register(abortPlugin);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: titleText,
        color: "#e2e8f0",
        font: { size: 14, weight: "bold", family: "'Outfit', sans-serif" },
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: "#334155",
          font: { size: 11, family: "'Inter', sans-serif" },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 2) {
              return `Error at position ${context.label}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Position',
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif" },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#64748b", font: { size: 11, family: "'Inter', sans-serif" } },
      },
      y: {
        title: {
          display: true,
          text: 'Bit Value',
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif" },
        },
        min: -0.1,
        max: 1.1,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { 
          color: "#64748b", 
          font: { size: 11, family: "'Inter', sans-serif" },
          stepSize: 1,
          callback: function(value) {
            if (value === 0 || value === 1) return value;
            return null;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="graph-container">
      <h2 className="graph-title">Sifted Key Comparison Graph</h2>
      {isEavesdroppingDetected && (
        <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', fontSize: '0.9rem' }}>
          Transmission Aborted: High QBER ({qber.toFixed(2)}%) detected!
        </div>
      )}
      <div className="graph-card" style={{ height: '500px', width: '90%' }}>
        <Line data={data} options={options} />
      </div>
      <button className="graph-button" onClick={() => navigate("/")}>
        ← Back to Simulator
      </button>
    </div>
  );
}

export default GraphPage;