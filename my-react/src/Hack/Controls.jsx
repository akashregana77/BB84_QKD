import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import "../index.css";

function Controls({
  aliceBits,
  setAliceBits,
  aliceBases,
  setAliceBases,
  bobBits,
  setBobBits,
  bobBases,
  setBobBases,
  eveEnabled,
  eveGuesses,
  setEveGuesses,
  eveBases,
  setEveBases,
  siftedBits,
  setSiftedBits,
  qber,
  setQBER,
  finalKey,
  setFinalKey,
  keyAccepted,
  setKeyAccepted,
  numBits,
  setNumBits,
  resetAll,
  message,
  setMessage,
  encryptedMessage,
  setEncryptedMessage,
  decryptedMessage,
  setDecryptedMessage,
  simulationData,
  setSimulationData,
}) {
  const [loaderAppear, setLoaderAppear] = useState(false);
  const navigate = useNavigate();

  const generateAlice = async () => {
    resetAll();
    setLoaderAppear(true);
    try {
      const response = await fetch("http://localhost:5000/bb84", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n: numBits, eve: eveEnabled }),
      });
      if (!response.ok) {
        throw new Error("Failed to run simulation");
      }
      const data = await response.json();
      setSimulationData(data);
      setAliceBits(data.alice_bits);
      setAliceBases(data.alice_bases.map((b) => (b === "Z" ? "+" : "×")));
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate Alice bits from backend.");
    } finally {
      setLoaderAppear(false);
    }
  };

  const measureBob = () => {
    if (!simulationData) return;
    setBobBits(simulationData.bob_results);
    setBobBases(simulationData.bob_bases.map((b) => (b === "Z" ? "+" : "×")));
    setEveGuesses(simulationData.eve_results || []);
    setEveBases(
      simulationData.eve_bases
        ? simulationData.eve_bases.map((b) => (b === "Z" ? "+" : "×"))
        : []
    );
  };

  const siftKey = () => {
    if (aliceBits.length === 0 || bobBits.length === 0) return;
    const sifted = [];
    for (let i = 0; i < aliceBits.length; i++) {
      if (aliceBases[i] === bobBases[i]) {
        sifted.push({
          alice: aliceBits[i],
          bob: bobBits[i],
          aliceBase: aliceBases[i],
          bobBase: bobBases[i],
        });
      }
    }
    setSiftedBits(sifted);
  };

  const calculateQBER = () => {
    if (siftedBits.length === 0) return;
    const mismatches = siftedBits.filter((b) => b.alice !== b.bob).length;
    const qberLocal = (mismatches / siftedBits.length) * 100;
    setQBER(qberLocal);
    setKeyAccepted(qberLocal <= 15);
  };

  const generateFinalKey = () => {
    if (keyAccepted) {
      const key = siftedBits.map((b) => b.alice);
      setFinalKey(key);
    }
  };

  const handleEncrypt = () => {
    if (finalKey.length === 0 || !message) {
      setEncryptedMessage("Error: Generate a final key and enter a message.");
      return;
    }
    try {
      const messageBytes = new TextEncoder().encode(message);
      const keyBytes = new Uint8Array(Math.ceil(finalKey.length / 8));
      for (let i = 0; i < finalKey.length; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = 7 - (i % 8);
        keyBytes[byteIndex] |= finalKey[i] << bitIndex;
      }
      const encrypted = new Uint8Array(messageBytes.length);
      for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      setEncryptedMessage(btoa(String.fromCharCode(...encrypted)));
      setDecryptedMessage("");
    } catch (e) {
      setEncryptedMessage("Error: Failed to encrypt message.");
    }
  };

  const handleDecrypt = () => {
    if (finalKey.length === 0 || !encryptedMessage) {
      setDecryptedMessage("Error: No encrypted message or key available.");
      return;
    }
    try {
      const encryptedBytes = new Uint8Array(
        atob(encryptedMessage).split("").map((c) => c.charCodeAt(0))
      );
      const keyBytes = new Uint8Array(Math.ceil(finalKey.length / 8));
      for (let i = 0; i < finalKey.length; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = 7 - (i % 8);
        keyBytes[byteIndex] |= finalKey[i] << bitIndex;
      }
      const decrypted = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      setDecryptedMessage(new TextDecoder().decode(decrypted));
    } catch (e) {
      setDecryptedMessage("Error: Failed to decrypt message.");
    }
  };

  const handleViewGraph = () => {
    if (siftedBits.length === 0) {
      alert("Generate sifted bits first!");
      return;
    }
    navigate("/graph", {
      state: {
        siftedBits,  // Pass full siftedBits array
        qber,
        keyAccepted,
        eveEnabled,
      },
    });
  };

  // Inline SVG icon components for buttons
  const PlayIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );

  const MeasureIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const FilterIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );

  const CalcIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );

  const KeyIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );

  const ResetIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );

  const ChartIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );

  const LockIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const UnlockIcon = () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );

  return (
    <div className="controls">
      {loaderAppear ? (
        <Loader />
      ) : (
        <>
          <div className="range-control">
            <label htmlFor="numBits" className="range-label">
              Number of Bits: {numBits}
            </label>
            <input
              type="range"
              id="numBits"
              min="1"
              max="100"
              value={numBits}
              onChange={(e) => setNumBits(Number(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="button-group">
            <button onClick={generateAlice} className="button button-blue">
              <PlayIcon /> Generate Alice
            </button>
            <button
              onClick={measureBob}
              disabled={aliceBits.length === 0}
              className="button button-green"
            >
              <MeasureIcon /> Measure Bob
            </button>
            <button
              onClick={siftKey}
              disabled={bobBits.length === 0}
              className="button button-yellow"
            >
              <FilterIcon /> Sift Key
            </button>
            <button
              onClick={calculateQBER}
              disabled={siftedBits.length === 0}
              className="button button-orange"
            >
              <CalcIcon /> QBER
            </button>
            <button
              onClick={generateFinalKey}
              disabled={!keyAccepted}
              className="button button-purple"
            >
              <KeyIcon /> Final Key
            </button>
            <button onClick={resetAll} className="button button-red">
              <ResetIcon /> Reset
            </button>

            {qber !== null && (
              <button
                onClick={handleViewGraph}
                className="button button-graph"
              >
                <ChartIcon /> Graph
              </button>
            )}
          </div>

          {finalKey.length > 0 && (
            <div className="encryption-section">
              <h3 className="section-title">One-Time Pad Encryption</h3>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to encrypt"
                className="message-input"
              />
              <div className="button-group" style={{ position: 'static', background: 'transparent', border: 'none', backdropFilter: 'none', padding: '0', height: 'auto' }}>
                <button
                  onClick={handleEncrypt}
                  disabled={!message}
                  className="button button-encrypt"
                >
                  <LockIcon /> Encrypt
                </button>
                <button
                  onClick={handleDecrypt}
                  disabled={!encryptedMessage}
                  className="button button-decrypt"
                >
                  <UnlockIcon /> Decrypt
                </button>
              </div>
              <div className="message-display">
                <p>
                  <strong>Encrypted Message:</strong>{" "}
                  {encryptedMessage || "None"}
                </p>
                <p>
                  <strong>Decrypted Message:</strong>{" "}
                  {decryptedMessage || "None"}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Controls;