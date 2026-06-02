import React, { useState } from "react";
import BlochSphereModal from "./BlochSphereModal.jsx";
import "../index.css";

// Function to map bit + basis → quantum state symbol
function getStateSymbol(bit, basis) {
  if (basis === "+") {
    return bit === 0 ? "|0⟩ ↔ (0°)" : "|1⟩ ↕ (90°)";
  } else {
    return bit === 0 ? "|+⟩ ↗ (45°)" : "|−⟩ ↘ (135°)";
  }
}

function AlicePanel({ bits, bases }) {
  const [selectedQubit, setSelectedQubit] = useState(null);

  // Limit display to 10 bits
  const displayBits = bits.slice(0, 10);
  const displayBases = bases.slice(0, 10);

  return (
    <div className="alice-panel">
      <h2 className="panel-title">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Alice
        <span className="panel-badge">Sender</span>
      </h2>
      <div className="bit-container">
        {displayBits.length === 0 ? (
          <p className="no-data">Bits not generated yet</p>
        ) : (
          displayBits.map((bit, index) => (
            <div
              key={index}
              className="bit-item"
              onClick={() =>
                setSelectedQubit({
                  bit,
                  basis: displayBases[index],
                })
              }
              title="Click to view Bloch Sphere"
            >
              {/* Bit circle */}
              <div
                className={`bit-circle ${bit === 0 ? "bg-blue" : "bg-red"}`}
              >
                {bit}
              </div>

              {/* Basis (+ or ×) */}
              <div className="base-icon">
                {displayBases[index] === "+" ? "+" : "×"}
              </div>

              {/* State symbol */}
              <div className="state-symbol">
                {getStateSymbol(bit, displayBases[index])}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedQubit && (
        <BlochSphereModal
          bit={selectedQubit.bit}
          basis={selectedQubit.basis}
          onClose={() => setSelectedQubit(null)}
        />
      )}
    </div>
  );
}

export default AlicePanel;
