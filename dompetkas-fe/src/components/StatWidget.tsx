'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface StatWidgetProps {
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function StatWidget({ title, amount, type }: StatWidgetProps) {
  const { formatIDR } = useCurrency();

  const isIncome = type === 'income';

  return (
    <div className="glass-card p-5 flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-[10px] text-neutral-500 font-mono uppercase">{title}</p>
        <p className={`text-base font-semibold font-mono ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatIDR(amount)}
        </p>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${
        isIncome 
          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
          : 'bg-red-500/5 border-red-500/10 text-red-400'
      }`}>
        <i className={`fa-solid ${isIncome ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
      </div>
    </div>
  );
}