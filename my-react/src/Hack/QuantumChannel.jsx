import React from "react";
import "../index.css";

function QuantumChannel({ aliceBits, eveEnabled }) {
  return (
    <div className="quantum-channel">
      <h3 className="channel-title">
        <svg className="channel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        Quantum Channel
      </h3>

      {/* Animated particles */}
      {aliceBits.length > 0 && (
        <div className="channel-particles">
          <div className="channel-particle"></div>
          <div className="channel-particle"></div>
          <div className="channel-particle"></div>
          <div className="channel-particle"></div>
          <div className="channel-particle"></div>
        </div>
      )}

      <div className="qubit-container">
        {aliceBits.length === 0 ? (
          <p className="eve-warning">No qubits sent yet</p>
        ) : (
          aliceBits.map((bit, index) => (
            <div
              key={index}
              className={`qubit ${bit === 0 ? "bg-blue" : "bg-red"}`}
            >
              {bit}
            </div>
          ))
        )}
      </div>
      {eveEnabled && (
        <p className="eve-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Eve is intercepting!
        </p>
      )}
    </div>
  );
}

export default QuantumChannel;