import { Info, Eye, Lock, Shield } from 'lucide-react';

export default function IntroSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <Info className="w-8 h-8 text-purple-400" />
        Ce este Tor?
      </h2>

      <div className="bg-white/5 rounded-xl p-6 border border-purple-400/30">
        <p className="text-lg leading-relaxed mb-4">
          Tor (The Onion Router) este un sistem de comunicare anonim care permite
          utilizatorilor să navigheze pe internet fără a dezvălui identitatea sau
          locația lor. Numele provine de la metoda de criptare în straturi,
          asemănătoare cu straturile unei cepe.
        </p>
        <p className="text-lg leading-relaxed">
          Dezvoltat inițial de US Naval Research Laboratory, Tor este acum un
          proiect open‑source susținut de comunitatea internațională de securitate
          cibernetică.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-400/30 hover:scale-105 transition-transform">
          <Eye className="w-10 h-10 mb-3 text-purple-400" />
          <h3 className="text-xl font-bold mb-2">Anonimitate</h3>
          <p className="text-purple-200">Ascunde identitatea și locația utilizatorilor</p>
        </div>
        <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-400/30 hover:scale-105 transition-transform">
          <Lock className="w-10 h-10 mb-3 text-blue-400" />
          <h3 className="text-xl font-bold mb-2">Criptare</h3>
          <p className="text-blue-200">Multiple straturi de criptare pentru securitate</p>
        </div>
        <div className="bg-linear-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30 hover:scale-105 transition-transform">
          <Shield className="w-10 h-10 mb-3 text-green-400" />
          <h3 className="text-xl font-bold mb-2">Protecție</h3>
          <p className="text-green-200">Împotriva supravegherii și analizei traficului</p>
        </div>
      </div>
    </div>
  );
}