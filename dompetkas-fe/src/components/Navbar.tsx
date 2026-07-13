'use client';

import { useAuthStore } from '@/stores/useAuthStore';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-14 border-b border-white/5 bg-[#09090b]/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <div className="text-[10px] font-medium text-neutral-500 font-mono tracking-wider uppercase">
        Console // Operational Dashboard
      </div>
      
      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Secure Connection
        </span>
        
        <div className="hidden sm:block border-l border-white/10 h-4 mx-1"></div>
        
        <span className="text-neutral-300 font-medium hidden sm:inline">
          {user?.name || 'Personal Account'}
        </span>
      </div>
    </header>
  );
}