"use client";
import React, { useState, useRef, useCallback } from "react";
import { DoublePendulum } from "@/app/components/DoublePendulum";
import { EntropyVisualizer } from "@/app/components/EntropyVisualizer";
import { EntropyCollector, formatKey } from "@/app/lib/crypto-utils";

export default function CryptoPendulumPage() {
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyLength, setKeyLength] = useState(32);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [entropyLevel, setEntropyLevel] = useState(0);
  const [poolStats, setPoolStats] = useState({ mean: 0, variance: 0, entropy: 0 });

  const entropyCollector = useRef(new EntropyCollector());

  const handleEntropy = useCallback((data: number[]) => {
    entropyCollector.current.addEntropy(data);
    setEntropyLevel(entropyCollector.current.getEntropyLevel());
    setPoolStats(entropyCollector.current.getPoolStats());
  }, []);

  const generateKey = async () => {
    setIsGenerating(true);
    try {
      const key = await entropyCollector.current.generateKey(keyLength);
      setGeneratedKeys((prev) => [key, ...prev].slice(0, 10));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Generarea a eșuat");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copiat!");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      setCopyStatus("Eroare la copiere");
    }
  };

  const resetEntropy = () => {
    entropyCollector.current.reset();
    setEntropyLevel(0);
    setPoolStats({ mean: 0, variance: 0, entropy: 0 });
  };

  const exportKeys = () => {
    const data = generatedKeys.join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chei-crypto-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-purple-950 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎭 Generator Cripto cu Pendul Caotic
          </h1>
          <p className="text-gray-400 text-lg">
            Valorifică puterea teoriei haosului pentru chei criptografice cu adevărat aleatoare
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stânga: Pendul */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">⚡</span>
                Pendul Dublu
              </h2>
              <DoublePendulum onEntropy={handleEntropy} isActive={true} />
            </div>

            {/* Info */}
            <div className="bg-linear-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>🔬</span>
                Cum funcționează
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>
                    Pendulul dublu prezintă <strong>comportament haotic</strong> - modificări minuscule duc la rezultate complet diferite
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>
                    Poziția, viteza și unghiurile sunt eșantionate la frecvență înaltă
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>
                    Combinat cu mișcările mouse-ului și entropie de sistem via SHA-256
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>
                    Rezultat: chei aleatoare sigure criptografic
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dreapta: Controale & Output */}
          <div className="space-y-6">
            {/* Afișare Entropie */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Pool de Entropie
              </h2>
              <EntropyVisualizer entropyLevel={entropyLevel} poolStats={poolStats} />
            </div>

            {/* Controale */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">⚙️</span>
                Generator de Chei
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lungime Cheie (bytes)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="16"
                      max="64"
                      step="8"
                      value={keyLength}
                      onChange={(e) => setKeyLength(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-lg font-mono font-bold w-16 text-center bg-gray-700 rounded px-2 py-1">
                      {keyLength}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {keyLength * 8} biți = {keyLength * 2} caractere hex
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={generateKey}
                    disabled={isGenerating || entropyLevel < 25}
                    className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generare...
                      </span>
                    ) : (
                      "🔑 Generează Cheie"
                    )}
                  </button>

                  <button
                    onClick={resetEntropy}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    title="Resetează pool-ul de entropie"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* Chei Generate */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">🔐</span>
                  Chei Generate
                  {generatedKeys.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">
                      ({generatedKeys.length})
                    </span>
                  )}
                </h2>
                {generatedKeys.length > 0 && (
                  <button
                    onClick={exportKeys}
                    className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-all"
                  >
                    📥 Exportă
                  </button>
                )}
              </div>

              {copyStatus && (
                <div className="mb-3 bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm text-center">
                  {copyStatus}
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {generatedKeys.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Nu au fost generate chei încă. Mișcă pendulul și apasă generează!
                  </div>
                ) : (
                  generatedKeys.map((key, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 rounded-lg p-3 font-mono text-xs break-all hover:bg-gray-900/70 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-gray-400 text-[10px] mb-1">
                            Cheia #{generatedKeys.length - index}
                          </div>
                          <div className="text-gray-200">{formatKey(key)}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(key)}
                          className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded transition-all text-xs"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}