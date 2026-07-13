'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface CardWalletProps {
  id: number;
  name: string;
  balance: number;
}

export default function CardWallet({ id, name, balance }: CardWalletProps) {
  const { formatIDR } = useCurrency();

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-32 bg-[#09090b]/40 hover:bg-[#09090b]/80 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-neutral-200">{name}</h3>
          <p className="text-[9px] text-neutral-500 font-mono uppercase">ID: W-{id}</p>
        </div>
        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 text-xs">
          <i className="fa-solid fa-credit-card text-[11px] opacity-70"></i>
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-[9px] text-neutral-500 font-mono uppercase">Saldo Tersedia</p>
        <p className="text-lg font-semibold text-white font-mono tracking-tight">
          {formatIDR(balance)}
        </p>
      </div>
    </div>
  );
}