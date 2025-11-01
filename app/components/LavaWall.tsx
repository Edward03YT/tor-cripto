"use client";
import { useRef, useState } from "react";
import { LavaLamp } from "./LavaLamp";
import CryptoJS from "crypto-js";

export function LavaWall({ lampCount = 3 }) {
  const [entropyKey, setEntropyKey] = useState<string>("");
  const entropyRef = useRef<number[]>([]);

  function handleEntropy(chunk: number[]) {
    const buf = entropyRef.current;
    buf.push(...chunk);
    if (buf.length > 500) buf.splice(0, buf.length - 500);
  }

  function generateKey() {
    if (entropyRef.current.length === 0) {
      alert("Please wait a bit for the lamps to move...");
      return;
    }
    const joined = entropyRef.current.join("-");
    const hash = CryptoJS.SHA256(joined).toString();
    setEntropyKey(hash);
  }

  function resetKey() {
    entropyRef.current = [];
    setEntropyKey("");
  }

  const lamps = Array.from({ length: lampCount }).map((_, i) => (
    <LavaLamp key={i} seed={Math.random()} hue={210} onEntropy={handleEntropy} />
  ));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {lamps}
      <div
        style={{
          width: "100%",
          fontFamily: "monospace",
          color: "#00aaff",
          background: "rgba(0,0,0,0.6)",
          padding: "15px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(0,150,255,0.3)",
          marginTop: "20px",
        }}
      >
        🔐 Entropy Key:{" "}
        {entropyKey ? entropyKey.slice(0, 32) + "…" : "no key generated"}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={generateKey}
            style={{
              marginRight: "10px",
              padding: "8px 14px",
              background: "#0077ff",
              color: "white",
              fontFamily: "monospace",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Generate Key
          </button>
          <button
            onClick={resetKey}
            style={{
              padding: "8px 14px",
              background: "gray",
              color: "white",
              fontFamily: "monospace",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}