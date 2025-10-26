'use client';
import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  Eye,
  Server,
  Package,
  MessageSquare,
  Lock,
} from 'lucide-react';

export default function RoutingSection() {
  const [routingDemo, setRoutingDemo] = useState(false);
  const [activeNode, setActiveNode] = useState(-1);
  const [phase, setPhase] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [deliveredMessage, setDeliveredMessage] = useState('');
  const [inputMessage, setInputMessage] = useState('Salut, Tor!');

  const nodes = [
    { id: 1, name: 'Client', type: 'client' },
    { id: 2, name: 'Nod Intrare', type: 'entry', key: 'K1' },
    { id: 3, name: 'Nod Mijloc', type: 'middle', key: 'K2' },
    { id: 4, name: 'Nod Ieșire', type: 'exit', key: 'K3' },
    { id: 5, name: 'Destinație', type: 'destination' },
  ];

  const startRouting = () => {
    if (routingDemo || !inputMessage.trim()) return;
    setRoutingDemo(true);
    setDeliveredMessage('');
    setPhase('encrypt');
    setActiveNode(0);

    // faza 1 – criptare
    const forward = setInterval(() => {
      setActiveNode(prev => {
        if (prev >= 4) {
          clearInterval(forward);
          setPhase('decrypt');
          // faza 2 – decriptare invers
          let step = 4;
          const backward = setInterval(() => {
            setActiveNode(step);
            step--;
            if (step < 0) {
              clearInterval(backward);
              setTimeout(() => {
                setDeliveredMessage(inputMessage);
                setRoutingDemo(false);
                setActiveNode(-1);
              }, 600);
            }
          }, 900);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
        <Globe className="w-8 h-8 text-purple-400" />
        Rutarea Onion – Criptare și Decriptare Vizuală
      </h2>

      <p className="text-lg leading-relaxed text-purple-100">
        Introdu mesajul tău și urmărește cum este criptat prin fiecare nod Tor.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Scrie mesajul aici..."
          className="flex-1 px-4 py-2 rounded-lg border border-purple-400/50 bg-white/10 text-white focus:outline-none focus:ring focus:ring-purple-500/50"
        />
        <button
          onClick={startRouting}
          disabled={routingDemo}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg font-bold transition-all shadow-md hover:shadow-xl hover:scale-105 disabled:opacity-60"
        >
          <RefreshCw
            className={`w-5 h-5 ${routingDemo ? 'animate-spin' : ''}`}
          />
          {routingDemo ? 'În lucru...' : 'Simulează Rutarea'}
        </button>
      </div>

      {/* linia de noduri */}
      <div className="relative py-8">
        <div className="flex items-center justify-between">
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-24 h-24 flex items-center justify-center rounded-full border-4 transition-all duration-500 ${
                    activeNode === i
                      ? 'border-purple-400 bg-purple-500/50 shadow-2xl scale-110'
                      : activeNode > i
                      ? 'border-purple-400/40 bg-purple-500/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  {node.type === 'client' && <Eye className="w-10 h-10" />}
                  {node.type === 'destination' && (
                    <Globe className="w-10 h-10" />
                  )}
                  {['entry', 'middle', 'exit'].includes(node.type) && (
                    <Server className="w-10 h-10" />
                  )}

                  {/* mesaj în tranzit */}
                  {activeNode === i && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                        <MessageSquare className="w-4 h-4 text-purple-700" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm font-bold">{node.name}</p>
                {activeNode === i && node.key && (
                  <div className="mt-2 text-xs font-semibold bg-white/20 rounded-full px-3 py-1 animate-pulse">
                    {phase === 'encrypt' ? (
                      <>
                        <Lock className="inline w-3 h-3 mr-1 text-green-400" />
                        Encrypt({node.key})
                      </>
                    ) : (
                      <>🔓 Decrypt({node.key})</>
                    )}
                  </div>
                )}
              </div>

              {i < nodes.length - 1 && (
                <div className="flex-1 h-2 mx-4 bg-white/10 rounded-full relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-1000 ${
                      activeNode >= i ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      transform:
                        activeNode > i
                          ? 'translateX(0)'
                          : 'translateX(-100%)',
                      transition:
                        'transform 1s ease-in-out, opacity 0.3s',
                    }}
                  />
                  {routingDemo && (
                    <div className="absolute top-0 left-0 w-3 h-2 bg-white rounded-full animate-[moveSpark_1.2s_linear_infinite]" />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* mesaj livrat */}
      {deliveredMessage && (
        <div className="mt-12 text-center animate-fadeIn flex flex-col items-center gap-3">
          <Package className="w-10 h-10 text-green-400 animate-bounce" />
          <div className="px-6 py-4 bg-green-500/20 border border-green-400/50 rounded-xl shadow-md">
            <p className="text-green-300 text-lg font-semibold">
              Mesaj livrat cu succes:
            </p>
            <p className="font-mono text-lg text-white mt-1">
              {deliveredMessage}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes moveSpark {
          0% {
            transform: translateX(0);
            opacity: 0.8;
          }
          50% {
            transform: translateX(50%);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0.8;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}