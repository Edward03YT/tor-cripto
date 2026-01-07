'use client';
import React, { useState } from 'react';
import { Info, Lock, Globe, Shield, Gamepad2Icon, Gamepad, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TorHeader from './components/TorHeader';
import TorTabs from './components/TorTabs';
import IntroSection from './components/IntroSection';
import RoutingSection from './components/RoutingSection';
import EncryptionSection from './components/EncryptionSection';
import SecuritySection from './components/SecuritySection';
import Footer from './components/Footer';

export default function TorCryptoApp() {
  const [activeTab, setActiveTab] = useState('intro');
  const router = useRouter();

  const tabs = [
    { id: 'intro', label: 'Introducere', icon: Info },
    { id: 'routing', label: 'Rutare Onion', icon: Globe },
    { id: 'encryption', label: 'Criptografie', icon: Lock },
    { id: 'security', label: 'Securitate', icon: Shield },
    { id: 'lava-demo', label: 'Lava', icon: Gamepad },
    { id: 'pendulum-demo', label: 'Pendulum', icon: Gamepad2Icon },
    { id: 'about', label: 'About', icon: Info },
  ];

  // REZOLVARE 1: Am adăugat tipul ': string' la parametrul tabId
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    if (tabId === 'lava-demo') {
      router.push('/lava-lamps');
    } else if (tabId === 'pendulum-demo') {
      router.push('/crypto-pendulum');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-blue-900 text-white relative">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TorHeader />
        <TorTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {activeTab === 'intro' && <IntroSection />}
          {activeTab === 'routing' && <RoutingSection />}
          {activeTab === 'encryption' && <EncryptionSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'about' && (
            <div className="text-center py-10">
              <Link href="/tor" className="text-xl text-purple-300 hover:text-pink-400 underline font-semibold transition-colors">
                Află mai multe despre criptografia Tor →
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Butonul Plutitor pentru Chat */}
      <Link 
        href="/chat"
        // REZOLVARE 2: Am schimbat 'bg-gradient-to-r' în 'bg-linear-to-r' conform warning-ului
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl 
                   bg-linear-to-r from-pink-500 to-purple-600 
                   hover:from-pink-400 hover:to-purple-500 
                   hover:scale-110 active:scale-95 transition-all duration-300
                   border border-white/20 group"
        aria-label="Chat Bot"
      >
        <MessageCircle className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        
        {/* Efect de pulsare */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>
      </Link>
    </div>
  );
}