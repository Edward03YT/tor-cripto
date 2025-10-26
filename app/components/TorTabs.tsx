import React from 'react';
import { LucideIcon } from 'lucide-react'; // asta ne oferă tipul pentru iconițele din lucide-react

// ✨ Definim tipurile de proprietăți ale componentului
interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TorTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TorTabs({ tabs, activeTab, onTabChange }: TorTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50 scale-105'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}