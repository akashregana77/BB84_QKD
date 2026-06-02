import React from "react";
import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="loader-dot"></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
