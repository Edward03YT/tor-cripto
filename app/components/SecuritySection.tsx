'use client';
import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function SecuritySection() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <Shield className="w-8 h-8 text-purple-400" />
        Securitate și Limitări
      </h2>

      <div className="space-y-4">
        <div className="bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
          <h3 className="text-xl font-bold mb-3">✓ Avantaje de Securitate</h3>
          <ul className="space-y-2 list-inside text-sm">
            <li>• Protecție împotriva analizei de trafic și supravegherii</li>
            <li>• Ascunderea adresei IP și locației geografice</li>
            <li>• Acces la servicii .onion</li>
            <li>• Evitarea cenzurii și blocării geografice</li>
          </ul>
        </div>

        <div className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
          <h3 className="text-xl font-bold mb-3">⚠ Limitări și Vulnerabilități</h3>
          <ul className="space-y-2 list-inside text-sm">
            <li>• Viteză redusă (conexiune prin multiple relay‑uri)</li>
            <li>• Nodurile de ieșire pot vedea traficul necriptat</li>
            <li>• Posibil atac de corelație de trafic</li>
            <li>• Nu protejează împotriva malware sau keylogger‑ilor</li>
          </ul>
        </div>

        <div className="bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold mb-3">🛡️ Bune Practici</h3>
          <ul className="space-y-2 list-inside text-sm">
            <li>• Folosește mereu HTTPS împreună cu Tor</li>
            <li>• Evită torrentele prin Tor</li>
            <li>• Nu dezvălui informații personale</li>
            <li>• Utilizează Tor Browser Bundle</li>
          </ul>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-6 px-6 py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
      >
        {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        {showDetails ? 'Ascunde Detalii Tehnice' : 'Arată Detalii Tehnice'}
      </button>

      {showDetails && (
        <div className="bg-white/5 rounded-xl p-6 border border-purple-400/30 mt-4 text-sm">
          <h3 className="text-xl font-bold mb-4">Detalii Tehnice Avansate</h3>
          <ul className="space-y-2 list-inside">
            <li>• Protocol Onion Routing (OR)</li>
            <li>• Conexiuni TLS între noduri</li>
            <li>• Chei efemere și Perfect Forward Secrecy</li>
            <li>• Directory authorities (≈ 10)</li>
            <li>• Circuit construction ≈ 3‑5 secunde</li>
            <li>• Protocol bazat pe celule de 512 bytes</li>
          </ul>
        </div>
      )}
    </div>
  );
}