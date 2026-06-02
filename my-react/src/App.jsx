import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Hack/Header.jsx";
import AlicePanel from "./Hack/AlicePanel.jsx";
import BobPanel from "./Hack/BobPanel.jsx";
import KeyProcessingPanel from "./Hack/KeyProcessingPanel.jsx";
import QuantumChannel from "./Hack/QuantumChannel.jsx";
import Controls from "./Hack/Controls.jsx";
import EveToggle from "./Hack/EveToggle.jsx";
import GraphPage from "./Hack/GraphPage.jsx";
import Navbar from "./Hack/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ArchitecturePage from "./pages/ArchitecturePage.jsx";
import QC from "./pages/QC.jsx";

import "./index.css";

function App() {
  const [aliceBits, setAliceBits] = useState([]);
  const [aliceBases, setAliceBases] = useState([]);
  const [bobBits, setBobBits] = useState([]);
  const [bobBases, setBobBases] = useState([]);
  const [eveEnabled, setEveEnabled] = useState(false);
  const [eveGuesses, setEveGuesses] = useState([]);
  const [eveBases, setEveBases] = useState([]);
  const [siftedBits, setSiftedBits] = useState([]);
  const [qber, setQBER] = useState(null);
  const [finalKey, setFinalKey] = useState([]);
  const [keyAccepted, setKeyAccepted] = useState(null);
  const [numBits, setNumBits] = useState(20);
  const [message, setMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [simulationData, setSimulationData] = useState(null);

  const resetAll = () => {
    setAliceBits([]);
    setAliceBases([]);
    setBobBits([]);
    setBobBases([]);
    setEveGuesses([]);
    setEveBases([]);
    setSiftedBits([]);
    setQBER(null);
    setFinalKey([]);
    setKeyAccepted(null);
    setMessage("");
    setEncryptedMessage("");
    setDecryptedMessage("");
    setSimulationData(null);
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Simulator Page */}
        <Route
          path="/"
          element={
            <div className="app-container">
              <Header title="BB84 Quantum Key Distribution Simulator" />
              <div className="channel-toggle">
                <QuantumChannel aliceBits={aliceBits} eveEnabled={eveEnabled} />
                <EveToggle enabled={eveEnabled} setEnabled={setEveEnabled} />
              </div>
              <div className="panel-grid">
                <AlicePanel bits={aliceBits} bases={aliceBases} />
                <BobPanel
                  bits={bobBits}
                  bases={bobBases}
                  aliceBits={aliceBits}
                  aliceBases={aliceBases}
                  eveEnabled={eveEnabled}
                  eveGuesses={eveGuesses}
                  eveBases={eveBases}
                />
              </div>
              <KeyProcessingPanel
                siftedBits={siftedBits}
                qber={qber}
                finalKey={finalKey}
                keyAccepted={keyAccepted}
                eveEnabled={eveEnabled}
              />
              <Controls
                aliceBits={aliceBits}
                setAliceBits={setAliceBits}
                aliceBases={aliceBases}
                setAliceBases={setAliceBases}
                bobBits={bobBits}
                setBobBits={setBobBits}
                bobBases={bobBases}
                setBobBases={setBobBases}
                eveEnabled={eveEnabled}
                eveGuesses={eveGuesses}
                setEveGuesses={setEveGuesses}
                eveBases={eveBases}
                setEveBases={setEveBases}
                siftedBits={siftedBits}
                setSiftedBits={setSiftedBits}
                qber={qber}
                setQBER={setQBER}
                finalKey={finalKey}
                setFinalKey={setFinalKey}
                keyAccepted={keyAccepted}
                setKeyAccepted={setKeyAccepted}
                numBits={numBits}
                setNumBits={setNumBits}
                resetAll={resetAll}
                message={message}
                setMessage={setMessage}
                encryptedMessage={encryptedMessage}
                setEncryptedMessage={setEncryptedMessage}
                decryptedMessage={decryptedMessage}
                setDecryptedMessage={setDecryptedMessage}
                simulationData={simulationData}
                setSimulationData={setSimulationData}
              />
            </div>
          }
        />
        {/* Graph Page */}
        <Route path="/graph" element={<GraphPage />} />
        {/* New Pages */}
        <Route path="/home" element={<HomePage />} />

        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/qc" element={<QC />} />

      </Routes>
    </Router>
  );
}

export default App;
