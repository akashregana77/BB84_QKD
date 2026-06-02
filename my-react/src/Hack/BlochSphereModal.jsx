import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "../index.css";

/**
 * BlochSphereModal — renders a 3D Bloch Sphere visualization
 * for a given qubit (bit value + basis).
 *
 * Props:
 *   bit    — 0 or 1
 *   basis  — "+" (Z / rectilinear) or "×" (X / diagonal)
 *   onClose — callback to close the modal
 */
function BlochSphereModal({ bit, basis, onClose }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Determine the state label and 3D vector direction
  const getStateInfo = () => {
    if (basis === "+") {
      // Rectilinear / Z-basis
      if (bit === 0) return { label: "|0⟩", axis: "+Z", vector: [0, 1, 0] };
      else return { label: "|1⟩", axis: "−Z", vector: [0, -1, 0] };
    } else {
      // Diagonal / X-basis
      if (bit === 0) return { label: "|+⟩", axis: "+X", vector: [1, 0, 0] };
      else return { label: "|−⟩", axis: "−X", vector: [-1, 0, 0] };
    }
  };

  const stateInfo = getStateInfo();

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const R = 1.6; // Sphere radius

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(3, 2.2, 3);
    camera.lookAt(0, 0, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── OrbitControls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;

    // ── Ambient light ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // ── Wireframe Sphere ──
    const sphereGeo = new THREE.SphereGeometry(R, 32, 24);
    const sphereWire = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      })
    );
    scene.add(sphereWire);

    // Translucent shell
    const sphereShell = new THREE.Mesh(
      new THREE.SphereGeometry(R, 32, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.08,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    );
    scene.add(sphereShell);

    // ── Equator ring ──
    const ringGeo = new THREE.RingGeometry(R - 0.005, R + 0.005, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // ── Axes ──
    const axisLength = R + 0.5;
    const axisColors = {
      x: 0xef4444, // red
      y: 0x0ea5e9, // blue (Z-axis in Bloch = vertical)
      z: 0x10b981, // green
    };

    const createAxis = (dir, color) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...dir.map((d) => d * -axisLength)),
        new THREE.Vector3(...dir.map((d) => d * axisLength)),
      ]);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      });
      return new THREE.Line(geo, mat);
    };

    scene.add(createAxis([1, 0, 0], axisColors.x));
    scene.add(createAxis([0, 1, 0], axisColors.y));
    scene.add(createAxis([0, 0, 1], axisColors.z));

    // ── Axis Labels (Sprites) ──
    const createLabel = (text, position, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.font = "bold 36px Outfit, Inter, sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 32, 32);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(...position);
      sprite.scale.set(0.4, 0.4, 0.4);
      return sprite;
    };

    scene.add(createLabel("X", [axisLength + 0.3, 0, 0], "#ef4444"));
    scene.add(createLabel("Y", [0, 0, axisLength + 0.3], "#10b981"));
    scene.add(createLabel("Z", [0, axisLength + 0.3, 0], "#0ea5e9"));

    // ── State Vector Arrow ──
    const vecDir = new THREE.Vector3(
      stateInfo.vector[0],
      stateInfo.vector[1],
      stateInfo.vector[2]
    ).normalize();

    const arrowColor = basis === "+" ? 0x0ea5e9 : 0x3b82f6;
    const arrow = new THREE.ArrowHelper(
      vecDir,
      new THREE.Vector3(0, 0, 0),
      R,
      arrowColor,
      0.25,
      0.14
    );
    scene.add(arrow);

    // Glow sphere at the tip
    const tipPos = vecDir.clone().multiplyScalar(R);
    const glowGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: arrowColor,
      transparent: true,
      opacity: 0.8,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.position.copy(tipPos);
    scene.add(glowSphere);

    // Point light at tip for glow effect
    const pointLight = new THREE.PointLight(arrowColor, 2, 3);
    pointLight.position.copy(tipPos);
    scene.add(pointLight);

    // ── State label sprite at tip ──
    const stateLabel = createLabel(
      stateInfo.label,
      [tipPos.x + 0.3, tipPos.y + 0.3, tipPos.z],
      basis === "+" ? "#0ea5e9" : "#3b82f6"
    );
    stateLabel.scale.set(0.5, 0.5, 0.5);
    scene.add(stateLabel);

    // ── Animation Loop ──
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Pulse the glow
      glowSphere.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
      pointLight.intensity = 2 + Math.sin(t * 3) * 0.8;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bit, basis]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const basisLabel = basis === "+" ? "Rectilinear (Z)" : "Diagonal (X)";

  return (
    <div className="bloch-modal-overlay" onClick={onClose}>
      <div className="bloch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bloch-modal-header">
          <h3 className="bloch-modal-title">Bloch Sphere Visualization</h3>
          <button className="bloch-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="bloch-canvas-container" ref={canvasRef} />

        <div className="bloch-info">
          <div className="bloch-info-item">
            <div className="bloch-info-label">State</div>
            <div className="bloch-info-value">{stateInfo.label}</div>
          </div>
          <div className="bloch-info-item">
            <div className="bloch-info-label">Bit</div>
            <div className="bloch-info-value">{bit}</div>
          </div>
          <div className="bloch-info-item">
            <div className="bloch-info-label">Basis</div>
            <div className="bloch-info-value">{basisLabel}</div>
          </div>
          <div className="bloch-info-item">
            <div className="bloch-info-label">Axis</div>
            <div className="bloch-info-value">{stateInfo.axis}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlochSphereModal;
