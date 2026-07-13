'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';

export default function DashboardPage() {
  const { token } = useAuthStore();
  
  // 🛠️ FIX TOTAL: Ambil langsung state bahasa Inggris yang sudah di-mapping rapi oleh Zustand Store lu
  const { totalBalance, totalIncome, totalExpense, wallets, isLoading, fetchSummary } = useTransactionStore();
  const { formatIDR } = useCurrency();

  useEffect(() => {
    if (token) {
      fetchSummary(token);
    }
  }, [token, fetchSummary]);

  // 🛡️ Proteksi array kosong jika data rekening bernilai null/undefined saat loading awal
  const safeWallets = wallets ?? [];

  return (
    <div className="space-y-8">
      
      {/* 💳 KARTU UTAMA: TOTAL SALDO KEKAYAAN */}
      <div className="glass-card p-6 bg-gradient-to-br from-[#09090b] to-[#020202]">
        <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
          Total Kekayaan Gabungan
        </p>
        <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
          {isLoading ? (
            <i className="fa-solid fa-spinner animate-spin text-xl text-neutral-600"></i>
          ) : (
            formatIDR(totalBalance)
          )}
        </h2>
      </div>

      {/* 📊 GRID RINGKASAN ARUS KAS BULANAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KAS MASUK */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-neutral-500 font-mono uppercase">Arus Kas Masuk</p>
            <p className="text-base font-semibold text-emerald-400 font-mono">
              {isLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-xs text-neutral-600"></i>
              ) : (
                formatIDR(totalIncome)
              )}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
        </div>

        {/* KAS KELUAR */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-neutral-500 font-mono uppercase">Arus Kas Keluar</p>
            <p className="text-base font-semibold text-red-400 font-mono">
              {isLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-xs text-neutral-600"></i>
              ) : (
                formatIDR(totalExpense)
              )}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 text-xs">
            <i className="fa-solid fa-arrow-trend-down"></i>
          </div>
        </div>
      </div>

      {/* 📂 SEKSI: DAFTAR REKENING / DOMPET */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase">Daftar Akun Rekening</h3>
          <span className="text-[10px] text-neutral-500 font-mono">Total: {safeWallets.length}</span>
        </div>

        {isLoading && safeWallets.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-600 font-mono">
            Memuat data rekening...
          </div>
        ) : safeWallets.length === 0 ? (
          <div className="glass-card p-6 text-center text-xs text-neutral-500 space-y-2">
            <p>Belum ada dompet atau rekening yang terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeWallets.map((wallet) => (
              <div key={wallet.id} className="glass-card p-5 flex flex-col justify-between h-28 bg-[#09090b]/40">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">{wallet.name}</span>
                  <i className="fa-solid fa-wallet text-xs text-neutral-600"></i>
                </div>
                <span className="text-lg font-semibold text-white font-mono">
                  {formatIDR(wallet.balance)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}