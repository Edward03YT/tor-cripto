'use client';
import React, { useState } from 'react';
import { Info, Lock, Globe, Shield } from 'lucide-react'
import Link from 'next/link';;
import TorHeader from './components/TorHeader';
import TorTabs from './components/TorTabs';
import IntroSection from './components/IntroSection';
import RoutingSection from './components/RoutingSection';
import EncryptionSection from './components/EncryptionSection';
import SecuritySection from './components/SecuritySection';
import Footer from './components/Footer';

export default function TorCryptoApp() {
  const [activeTab, setActiveTab] = useState('intro');

  const tabs = [
    { id: 'intro', label: 'Introducere', icon: Info },
    { id: 'routing', label: 'Rutare Onion', icon: Globe },
    { id: 'encryption', label: 'Criptografie', icon: Lock },
    { id: 'security', label: 'Securitate', icon: Shield },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TorHeader />
        <TorTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {activeTab === 'intro' && <IntroSection />}
          {activeTab === 'routing' && <RoutingSection />}
          {activeTab === 'encryption' && <EncryptionSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'about' && <Link href="/tor" className="text-purple-300 hover:text-pink-400 underline">
            Află mai multe despre criptografia Tor →
          </Link>}
        </div>

        <Footer />
      </div>
    </div>
  );
}