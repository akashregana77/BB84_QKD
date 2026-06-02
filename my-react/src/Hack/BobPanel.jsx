import React, { useState } from "react";
import BlochSphereModal from "./BlochSphereModal.jsx";
import "../index.css";

// Helper to show the quantum state symbols like in AlicePanel
function getStateSymbol(bit, basis) {
  if (basis === "+") {
    return bit === 0 ? "|0⟩ ↔ (0°)" : "|1⟩ ↕ (90°)";
  } else {
    return bit === 0 ? "|+⟩ ↗ (45°)" : "|−⟩ ↘ (135°)";
  }
}

function BobPanel({ bits, bases, eveEnabled }) {
  const [selectedQubit, setSelectedQubit] = useState(null);

  const displayBits = bits.slice(0, 10);
  const displayBases = bases.slice(0, 10);

  return (
    <div className="bob-panel">
      <h2 className="panel-title">
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Bob
        <span className="panel-badge">Receiver</span>
      </h2>

      {displayBits.length === 0 ? (
        <p className="no-data green">No data received yet.</p>
      ) : (
        <div className="section">
          <h3 className="section-title">Bob's Measured Bits</h3>
          <div className="bit-container">
            {displayBits.map((bit, index) => {
              const bitColor = bit === 0 ? "bg-blue" : "bg-red";

              return (
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
                  <div className={`bit-circle ${bitColor}`}>
                    {bit}
                  </div>

                  {/* Basis */}
                  <div className="base-icon green">
                    {displayBases[index] === "+" ? "+" : "×"}
                  </div>

                  {/* State symbol */}
                  <div className="state-symbol">
                    {getStateSymbol(bit, displayBases[index])}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export default BobPanel;
