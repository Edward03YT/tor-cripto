import { Globe } from 'lucide-react';

export default function TorHeader() {
  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Serviciul Tor
        </h1>
      </div>
      <p className="text-xl text-purple-200">
        The Onion Router - Anonimitate și Securitate Online
      </p>
    </header>
  );
}