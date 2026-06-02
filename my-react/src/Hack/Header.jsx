import React from "react";
import "../index.css";

function Header({ title }) {
  return (
    <header className="header">
      <div className="header-inner">
        <svg
          className="header-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Atom / quantum icon */}
          <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
        <h1 className="header-title">{title}</h1>
      </div>
    </header>
  );
}

export default Header;
