import React from "react";
import "../index.css";

function EveToggle({ enabled, setEnabled }) {
  return (
    <div className={`eve-toggle ${enabled ? "eve-active" : ""}`}>
      <span className="eve-label">
        <svg className="eve-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Eve
      </span>
      <div
        className={`toggle-button ${enabled ? "toggle-on" : "toggle-off"}`}
        onClick={() => setEnabled(!enabled)}
      >
        <div className="toggle-knob"></div>
      </div>
      <span className={`toggle-status ${enabled ? "status-on" : "status-off"}`}>
        {enabled ? "On" : "Off"}
      </span>
    </div>
  );
}

export default EveToggle;
