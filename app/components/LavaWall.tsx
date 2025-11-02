"use client";
import { useRef, useState, useEffect } from "react";
import { LavaLamp } from "./LavaLamp";
import { Zap, RefreshCw, Key, Activity, Lock, AlertCircle } from 'lucide-react';

// Simple SHA-256 implementation (no external dependencies)
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function LavaWall({ lampCount = 5 }) {
  const [entropyKey, setEntropyKey] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [entropyRate, setEntropyRate] = useState(0);
  const [totalEntropy, setTotalEntropy] = useState(0);
  const entropyRef = useRef<number[]>([]);
  const lastRateUpdate = useRef<number>(Date.now());
  const entropyCountSinceLastUpdate = useRef<number>(0);

  function handleEntropy(chunk: number[]) {
    const buf = entropyRef.current;
    buf.push(...chunk);
    if (buf.length > 1000) buf.splice(0, buf.length - 1000);
    
    entropyCountSinceLastUpdate.current += chunk.length;
    setTotalEntropy(buf.length);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastRateUpdate.current) / 1000;
      const rate = Math.round(entropyCountSinceLastUpdate.current / elapsed);
      setEntropyRate(rate);
      entropyCountSinceLastUpdate.current = 0;
      lastRateUpdate.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function generateKey() {
    if (entropyRef.current.length < 50) {
      alert("⚠️ Insuficientă entropie! Așteaptă câteva secunde pentru ca lava lampurile să genereze mai multe date caotice...");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const joined = entropyRef.current.join("-");
    const hash = await sha256(joined);
    setEntropyKey(hash);
    setIsGenerating(false);
  }

  function resetKey() {
    entropyRef.current = [];
    setEntropyKey("");
    setTotalEntropy(0);
    setEntropyRate(0);
  }

  // Generate random hues for lamps
  const lampHues = Array.from({ length: lampCount }).map((_, i) => 
    180 + (i * 40) % 180
  );

  const lamps = lampHues.map((hue, i) => (
    <div key={i} className="transform hover:scale-105 transition-transform duration-300">
      <LavaLamp 
        seed={Math.random() * 10000} 
        hue={hue} 
        onEntropy={handleEntropy} 
      />
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">
              Chaos Entropy Wall
            </h1>
          </div>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Generare criptografică bazată pe comportamentul chaotic și imprevizibil al lava lampurilor
          </p>
        </div>

        {/* Stats Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-400/30">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Rata Entropie</h3>
            </div>
            <p className="text-3xl font-bold text-blue-300">{entropyRate} bytes/s</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-400/30">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Buffer Entropie</h3>
            </div>
            <p className="text-3xl font-bold text-purple-300">{totalEntropy} bytes</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm p-6 rounded-2xl border border-green-400/30">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Status</h3>
            </div>
            <p className="text-2xl font-bold text-green-300">
              {totalEntropy < 50 ? "Colectare..." : "Gata să generez"}
            </p>
          </div>
        </div>

        {/* Lava Lamps Display */}
        <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-6">
            {lamps}
          </div>
        </div>

        {/* Key Generation Panel */}
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Cheie Criptografică SHA-256</h2>
          </div>

          {!entropyKey ? (
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-700 text-center">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400 font-mono">
                Nicio cheie generată încă
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Apasă butonul de mai jos pentru a genera o cheie din haosul lava lampurilor
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/50">
              <p className="text-sm font-semibold text-green-300 mb-3">🔐 Hash SHA-256 generat:</p>
              <div className="bg-black/70 p-4 rounded-lg font-mono text-sm text-green-400 break-all leading-relaxed shadow-inner">
                {entropyKey}
              </div>
              <p className="text-xs text-green-300/70 mt-3">
                ✓ Generat din {totalEntropy} bytes de entropie caotică
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={generateKey}
              disabled={isGenerating || totalEntropy < 50}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg
                transition-all duration-300 transform
                ${isGenerating || totalEntropy < 50
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Generare...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Generează Cheie
                </>
              )}
            </button>

            <button
              onClick={resetKey}
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg
                       bg-gradient-to-r from-gray-700 to-gray-800 text-white
                       hover:from-gray-600 hover:to-gray-700 transition-all duration-300
                       transform hover:scale-105"
            >
              <RefreshCw className="w-6 h-6" />
              Reset
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900/20 border border-blue-400/30 rounded-xl p-6">
            <p className="text-sm text-blue-200 leading-relaxed">
              <strong className="text-blue-300">💡 Cum funcționează:</strong> Fiecare lava lampă generează date imprevizibile 
              din mișcarea caotică a blob-urilor (poziție, viteză, temperatură). Aceste date sunt colectate continuu 
              și folosite pentru a genera hash-uri SHA-256 securizate - exact ca sistemul Cloudflare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}