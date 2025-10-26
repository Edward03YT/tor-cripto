'use client';
import React, { useState } from 'react';
import { Lock, Package } from 'lucide-react';

export default function EncryptionSection() {
  const [message, setMessage] = useState('Mesaj secret');
  const [encryptionStep, setEncryptionStep] = useState(0);

  const encryptionLayers = [
    { layer: 3, node: 'Nod Ieșire', key: 'K3' },
    { layer: 2, node: 'Nod Mijloc', key: 'K2' },
    { layer: 1, node: 'Nod Intrare', key: 'K1' },
  ];

  const startEncryption = () => {
    setEncryptionStep(1);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step > 8) {
        clearInterval(interval);
        setTimeout(() => setEncryptionStep(0), 2000);
      } else setEncryptionStep(step);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <Lock className="w-8 h-8 text-purple-400" />
        Criptografia Multi-Strat – Exemplu Complet
      </h2>

      <div className="bg-white/5 rounded-xl p-6 border border-purple-400/30 mb-6">
        <p className="text-lg leading-relaxed mb-4">
          Tor folosește criptare în straturi multiple. Fiecare nod poate
          decripta doar propriul strat, dezvăluind doar următorul hop.
        </p>
        <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-400/50">
          <p className="font-semibold mb-2">🔐 Mesaj Original:</p>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-purple-400/50 rounded-lg text-white"
            placeholder="Introdu un mesaj..."
          />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={startEncryption}
          disabled={encryptionStep > 0}
          className="flex items-center gap-2 px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Lock className="w-6 h-6" />
          Demonstrează Criptarea
        </button>
      </div>

      <div className="space-y-6">
        {/* strat 0 + straturi de criptare */}
        <div className={`transition-all ${encryptionStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
          <div className="bg-linear-to-r from-purple-500/20 to-purple-600/20 p-6 rounded-xl border-2 border-purple-400/50">
            <h3 className="text-xl font-bold mb-3">Mesaj Original</h3>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm break-all">{message}</div>
          </div>
        </div>

        {encryptionLayers.map((layer, index) => (
          <div
            key={layer.layer}
            className={`transition-all duration-700 ${
              encryptionStep >= layer.layer + 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="bg-linear-to-r from-pink-500/20 to-purple-600/20 p-6 rounded-xl border-2 border-pink-400/50 relative">
              <h3 className="text-xl font-bold mb-3">
                Criptare Strat {layer.layer} – {layer.node}
              </h3>
              <p className="text-sm mb-2 text-gray-300">
                Cheie simetrică: <span className="font-bold text-white">{layer.key}</span>
              </p>
              <div className="bg-black/30 p-4 rounded-lg font-mono text-sm break-all">
                Encrypt({layer.key},{' '}
                {index === 0 ? `"${message}"` : `Strat${layer.layer + 1}`}) → 
                <span className="text-green-400 ml-2">
                  {Array(20).fill('█').join('')}...{layer.key}_encrypted
                </span>
              </div>
            </div>
          </div>
        ))}

        {encryptionStep >= 5 && (
          <div className="bg-linear-to-r from-green-500/20 to-emerald-600/20 p-6 rounded-xl border-2 border-green-400/50">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
              <Package className="w-6 h-6 text-green-500" />
              Pachet Final Criptat (3 Straturi)
            </h3>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-xs break-all">
              <span className="text-blue-400">K1(</span>
              <span className="text-cyan-400">K2(</span>
              <span className="text-pink-400">K3(</span>
              <span className="text-green-400">"{message}"</span>
              <span className="text-pink-400">)))</span>
              <span className="text-yellow-400 ml-2">
                {Array(50).fill('█').join('')}
              </span>
            </div>
            <p className="text-sm text-green-300 mt-3">
              ✅ Mesajul este complet criptat și gata pentru transmisie prin rețea!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}