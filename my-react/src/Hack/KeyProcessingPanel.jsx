import React from "react";
import "../index.css";

function KeyProcessingPanel({ siftedBits, qber, finalKey, keyAccepted, eveEnabled }) {
  return (
    <div className="key-panel">
      {/* Sifted Bits */}
      <div className="section">
        <h3 className="section-title">Sifted Bits</h3>
        {siftedBits.length === 0 ? (
          <p>No sifted bits yet</p>
        ) : (
          <div className="bit-container">
            {siftedBits.map((bit, index) => (
              <div
                key={index}
                className={`sifted-bit ${
                  eveEnabled && bit.alice !== bit.bob ? "bg-yellow" : "bg-green"
                }`}
              >
                A: {bit.alice}, B: {bit.bob}
              </div>

            ))}
          </div>
        )}
      </div>

      {/* QBER */}
      {qber !== null && (
        <div className="section">
          <h3 className="section-title">QBER</h3>
          <div className="qber-bar">
            <div className="qber-fill bg-blue" style={{ width: `${qber}%` }}></div>
          </div>
          <p className="qber-value">{qber.toFixed(2)}%</p>
        </div>
      )}

      {/* Key Accepted/Rejected */}
      {keyAccepted !== null && (
        <p className={keyAccepted ? "key-accepted" : "key-rejected"}>
          {keyAccepted ? "Key Accepted" : "Key Rejected"}
        </p>
      )}

      {/* Final Key */}
      {finalKey.length > 0 && (
        <div className="section">
          <h3 className="section-title">Final Key</h3>
          <div className="bit-container">
            {finalKey.slice(0, 10).map((bit, index) => (
              <div
                key={index}
                className={`bit-circle ${bit === 0 ? "bg-blue" : "bg-red"}`}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KeyProcessingPanel;
