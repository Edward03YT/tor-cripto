'use client';
import React from 'react';
import { Shield, Lock, Globe, Layers, Code, Info } from 'lucide-react';

export default function TorInfoPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-950 via-purple-900 to-blue-900 text-white px-6 py-12 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* HEADER */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-purple-500/70 rounded-full flex items-center justify-center animate-pulse">
              <Globe className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-purple-400">
              Serviciul Tor & Criptografia Sa
            </h1>
          </div>
          <p className="text-purple-200 text-lg">
            O privire detaliată și intuitivă asupra mecanismelor Onion Routing și
            criptării multi‑strat care îi oferă Tor‑ului anonimitate și securitate.
          </p>
        </header>

        {/* CE ESTE TOR */}
        <section className="bg-white/10 p-8 rounded-2xl mb-10 border border-purple-400/20 shadow-xl">
          <h2 className="flex items-center gap-3 text-3xl font-bold mb-4">
            <Info className="w-7 h-7 text-purple-400" /> Ce este Tor?
          </h2>
          <p className="leading-relaxed text-lg mb-3">
            Tor (The Onion Router) este un sistem distribuit care permite
            anonimizarea comunicațiilor pe Internet. Utilizatorul își trimite
            traficul printr‑o rețea de noduri denumite
            <span className="text-purple-300 font-semibold"> relays </span>.
          </p>
          <p className="leading-relaxed text-lg">
            Fiecare mesaj este criptat în straturi succesive, ca învelișurile unei
            cepe. De aici și numele „Onion Routing”. Fiecare nod decriptează doar
            propriul strat, fără a cunoaște originea sau destinația completă.
          </p>
        </section>

        {/* CRIPTOGRAFIE MULTI-STRAT */}
        <section className="bg-white/10 p-8 rounded-2xl mb-10 border border-pink-400/20 shadow-lg">
          <h2 className="flex items-center gap-3 text-3xl font-bold mb-6 text-pink-300">
            <Lock className="w-8 h-8" /> Criptografia Multi‑Strat
          </h2>
          <div className="space-y-5">
            <p className="text-lg">
              Procesul este similar cu un set de cutii închise:
              mesajul tău este plasat într‑o cutie închisă de cheie K3,
              apoi acea cutie într‑o cutie K2, și în final într‑o cutie K1.
              Pe traseu, fiecare nod deschide doar cutia aferentă cheii sale.
            </p>

            <div className="bg-black/40 p-5 rounded-lg font-mono text-sm overflow-x-auto">
              <p>
                <span className="text-green-400">Mesaj:</span>{' '}
                "Salut, Tor!" <br />
              </p>
              <p className="mt-2">
                <span className="text-blue-400">Encrypt(K3, Mesaj)</span>{' '}
                → Mesaj₁<br />
                <span className="text-blue-400">Encrypt(K2, Mesaj₁)</span>{' '}
                → Mesaj₂<br />
                <span className="text-blue-400">Encrypt(K1, Mesaj₂)</span>{' '}
                → Pachet_final
              </p>
              <p className="mt-2 text-purple-300">
                Pachet_final este trimis în rețea → fiecare nod decriptează un strat:
              </p>
              <p className="mt-1">
                Nod Intrare → Decrypt(K1) → Mesaj₂<br />
                Nod Mijloc → Decrypt(K2) → Mesaj₁<br />
                Nod Ieșire → Decrypt(K3) → Mesaj Original
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-5 border border-blue-400/30">
                <h4 className="font-semibold text-blue-300 mb-2">
                  🔑 Cheia Simetrică (AES‑256)
                </h4>
                <p className="text-sm">
                  Fiecare strat folosește criptare AES‑256 pentru a codifica
                  informația între noduri.
                </p>
              </div>
              <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-5 border border-purple-400/30">
                <h4 className="font-semibold text-pink-300 mb-2">
                  📬 Schimbul De Chei (RSA / Diffie‑Hellman)
                </h4>
                <p className="text-sm">
                  Criptarea asimetrică stabilește cheile AES pentru fiecare nod fără
                  a le dezvălui intermediarilor.
                </p>
              </div>
              <div className="bg-linear-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-5 border border-green-400/30">
                <h4 className="font-semibold text-green-300 mb-2">
                  🔒 Integritatea (Hash SHA‑256)
                </h4>
                <p className="text-sm">
                  Fiecare pachet conține un hash SHA‑256 pentru verificarea
                  integrității in‑transit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LOGICĂ SIMPLIFICATĂ */}
        <section className="bg-white/10 p-8 rounded-2xl mb-10 border border-blue-400/20">
          <h2 className="flex items-center gap-3 text-3xl font-bold text-blue-300 mb-5">
            <Layers className="w-7 h-7" /> Logica Simplificată a Tor
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-purple-100 text-lg">
            <li>Browserul Tor alege automat 3 noduri aleatorii din rețea.</li>
            <li>Se stabilesc chei de sesiune unice cu fiecare nod.</li>
            <li>Mesajul este criptat în 3 straturi (K3, K2, K1).</li>
            <li>Pachetul este trimis → Intrare → Mijloc → Ieșire → Destinație.</li>
            <li>Fiecare nod decriptează doar un strat – niciodată tot mesajul.</li>
          </ol>
          <div className="mt-5 bg-black/40 rounded-xl p-5 font-mono text-xs overflow-x-auto">
            <pre>
{`function torEncrypt(msg) {
  let p = AES_Encrypt(msg, K3);
  p = AES_Encrypt(p, K2);
  p = AES_Encrypt(p, K1);
  return p; // Pachet final trimis
}

function torDecrypt(p) {
  p = AES_Decrypt(p, K1);
  p = AES_Decrypt(p, K2);
  p = AES_Decrypt(p, K3);
  return p; // Mesaj original
}`}
            </pre>
          </div>
        </section>

        {/* SECURITATE */}
        <section className="bg-white/10 p-8 rounded-2xl border border-green-400/30 mb-10">
          <h2 className="flex items-center gap-3 text-3xl font-bold text-green-300 mb-5">
            <Shield className="w-8 h-8" /> Avatarele Securității
          </h2>
          <ul className="list-inside space-y-2 text-lg text-green-100">
            <li>🧅 Anonimitate – niciun nod nu știe cine ești și unde vrei să mergi complet.</li>
            <li>🔑 Straturi de criptare – informația este citită parțial doar local.</li>
            <li>🛰 Rețea distribuită – fără un singur punct de eșec sau control.</li>
            <li>💡 Perfect Forward Secrecy – compromiterea unei chei nu compromite sesiunile trecute.</li>
          </ul>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-purple-300 opacity-80 text-sm mt-8">
          Pagina educațională – proiect Tor & Criptografie © 2024
        </footer>
      </div>
    </main>
  );
}