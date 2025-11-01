"use client";
import { useEffect, useRef, useState } from "react";
import { LavaLamp } from "./LavaLamp";
import CryptoJS from "crypto-js";

export function LavaWall({ lampCount = 12 }) {
    const [entropyKey, setEntropyKey] = useState<string>("");
    const entropyRef = useRef<number[]>([]); // 🔥 păstrează pool-ul fără a declanșa re-render

    // colectăm datele de la lămpi
    function handleEntropy(chunk: number[]) {
        const buf = entropyRef.current;
        buf.push(...chunk);
        if (buf.length > 500) buf.splice(0, buf.length - 500);
    }

    // interval stabil pentru hashing la fiecare secundă
    useEffect(() => {
        const interval = setInterval(() => {
            if (entropyRef.current.length > 0) {
                const joined = entropyRef.current.join("-");
                const hash = CryptoJS.SHA256(joined).toString();
                setEntropyKey(hash);
                // "amestecare" și golire parțială a pool-ului
                entropyRef.current = entropyRef.current.slice(
                    Math.floor(entropyRef.current.length / 2)
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []); // ⚙️ rulează o singură dată, nu se reinițializează

    const lamps = Array.from({ length: lampCount }).map((_, i) => (
        <LavaLamp key={i} seed={Math.random()} onEntropy={handleEntropy} />
    ));

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
            }}
        >
            {lamps}
            <div
                style={{
                    width: "100%",
                    fontFamily: "monospace",
                    color: "#ff9933",
                    background: "rgba(0,0,0,0.7)",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center",
                    boxShadow: "0 0 20px rgba(255, 100, 0, 0.3)",
                    paddingInline: "10 px",
                    
                }}
            >
                🔐 Entropy Hash:{" "}
                {entropyKey ? entropyKey.slice(0, 32) + "…" : "calculating..."}
            </div>
        </div>
    );
}