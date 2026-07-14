"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import {
  WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const formatAbbr = (value: number, currency: string): string => {
  const abs = Math.abs(value);
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : 'Rp';

  const fmt = (num: number, suffix: string) => {
    const rounded = parseFloat(num.toFixed(1));
    const display = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${symbol} ${display}${suffix}`;
  };

  if (abs >= 1_000_000_000_000) return fmt(value / 1_000_000_000_000, 'T');
  if (abs >= 1_000_000_000)     return fmt(value / 1_000_000_000, 'M');
  if (abs >= 1_000_000)         return fmt(value / 1_000_000, 'Jt');
  if (abs >= 1_000)             return fmt(value / 1_000, 'Rb');
  return `${symbol} ${value.toLocaleString('id-ID')}`;
};

const getCategoryStyle = (name: string): { color: string; icon: string } => {
  const n = name.toLowerCase();
  if (n.includes('makan') || n.includes('minuman') || n.includes('restoran') || n.includes('kopi'))
    return { color: 'bg-rose-500', icon: 'fa-utensils' };
  if (n.includes('transport') || n.includes('bensin') || n.includes('ojek') || n.includes('grab') || n.includes('tol'))
    return { color: 'bg-cyan-500', icon: 'fa-car' };
  if (n.includes('belanja') || n.includes('bulanan') || n.includes('shopping'))
    return { color: 'bg-violet-500', icon: 'fa-bag-shopping' };
  if (n.includes('tagihan') || n.includes('utilitas') || n.includes('listrik') || n.includes('wifi'))
    return { color: 'bg-yellow-500', icon: 'fa-bolt' };
  if (n.includes('kesehatan') || n.includes('medis') || n.includes('obat') || n.includes('dokter'))
    return { color: 'bg-emerald-500', icon: 'fa-heart-pulse' };
  if (n.includes('hiburan') || n.includes('kesenangan') || n.includes('nonton') || n.includes('game'))
    return { color: 'bg-pink-500', icon: 'fa-tv' };
  if (n.includes('pendidikan') || n.includes('kursus') || n.includes('buku'))
    return { color: 'bg-blue-500', icon: 'fa-graduation-cap' };
  if (n.includes('cicilan') || n.includes('hutang') || n.includes('kredit'))
    return { color: 'bg-orange-500', icon: 'fa-credit-card' };
  if (n.includes('donasi') || n.includes('sedekah') || n.includes('zakat'))
    return { color: 'bg-teal-500', icon: 'fa-hand-holding-heart' };
  if (n.includes('jajan') || n.includes('uang kopi'))
    return { color: 'bg-amber-500', icon: 'fa-mug-hot' };
  return { color: 'bg-neutral-500', icon: 'fa-circle-dot' };
};

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const {
    totalBalance,
    totalIncome,
    totalExpense,
    wallets,
    distribusiPengeluaran,
    trenGrafik,
    isLoading,
    fetchSummary
  } = useTransactionStore();

  const [activeCurrency, setActiveCurrency] = useState<string>('IDR');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('dompetkas_currency') || 'IDR';
      setActiveCurrency(savedCurrency.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSummary(token, activeCurrency);
    }
  }, [token, fetchSummary, activeCurrency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: activeCurrency,
      minimumFractionDigits: activeCurrency === 'IDR' ? 0 : 2
    }).format(value);
  };

  const formatBulanLabel = (bulanAngka: number) => {
    const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return namaBulan[bulanAngka - 1] || '';
  };

  const dataGrafikSiap = trenGrafik.map((item) => ({
    ...item,
    name: formatBulanLabel(item.bulan)
  }));

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Halo, {user?.name || 'Pengguna DompetKas'}! 👋
          </h1>
          <p className="text-xs text-neutral-400">
            Berikut ringkasan kesehatan finansial gabungan Anda dalam mata uang{' '}
            <span className="font-semibold text-emerald-400">{activeCurrency}</span>.
          </p>
        </div>
      </div>

      {/* KARTU RINGKASAN */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 font-mono uppercase tracking-wider">Total Kekayaan</span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
              <DollarSign className="h-4 w-4 opacity-80" />
            </div>
          </div>
          <div className="mt-4 space-y-0.5">
            <h3 className="text-2xl font-semibold text-white font-mono tracking-tight">
              {formatAbbr(totalBalance, activeCurrency)}
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono">Akumulasi terkonversi dari seluruh dompet</p>
          </div>
        </div>

        <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 font-mono uppercase tracking-wider">Pemasukan Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="h-4 w-4 opacity-80" />
            </div>
          </div>
          <div className="mt-4 space-y-0.5">
            <h3 className="text-2xl font-semibold text-emerald-400 font-mono tracking-tight">
              {formatAbbr(totalIncome, activeCurrency)}
            </h3>
            <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Aliran kas masuk terpantau aktif
            </p>
          </div>
        </div>

        <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 font-mono uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/40 flex items-center justify-center text-red-400">
              <ArrowDownLeft className="h-4 w-4 opacity-80" />
            </div>
          </div>
          <div className="mt-4 space-y-0.5">
            <h3 className="text-2xl font-semibold text-red-400 font-mono tracking-tight">
              {formatAbbr(totalExpense, activeCurrency)}
            </h3>
            <p className="text-[10px] text-red-500 font-mono">Aliran pemotongan anggaran beban</p>
          </div>
        </div>
      </div>

      {/* GRAFIK TREN CASHFLOW */}
      <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl">
        <div className="mb-6 space-y-0.5">
          <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Tren Cash Flow Tahunan</h2>
          <p className="text-[10px] text-neutral-500 font-mono">
            Perbandingan grafis mutasi masuk/keluar dalam mata uang preferensi {activeCurrency}
          </p>
        </div>

        <div className="h-[260px] w-full">
          {dataGrafikSiap.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500 font-mono italic">
              Tidak ada data grafik yang dapat dimuat.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafikSiap} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
                <XAxis dataKey="name" tickLine={false} stroke="#525252" fontSize={11} className="font-mono" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#525252"
                  fontSize={11}
                  className="font-mono"
                  tickFormatter={(v) => formatAbbr(v, activeCurrency)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#a3a3a3', marginBottom: '4px' }}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontFamily: 'monospace', color: '#a3a3a3' }} />
                <Bar dataKey="masuk" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="keluar" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GRID REKENING & DISTRIBUSI */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Daftar Rekening */}
        <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl">
          <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono mb-4 flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-neutral-400 opacity-80" /> Daftar Rekening
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {wallets.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono text-center py-6 italic">Belum ada rekening aktif.</p>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-black/40 hover:bg-black/80 transition-all duration-300"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-neutral-200">{wallet.name}</p>
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-white/5 border border-white/5 text-neutral-400">
                      {wallet.currency}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white font-mono">
                    {formatAbbr(wallet.balance, wallet.currency || 'IDR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Distribusi Pengeluaran — fixed: tambah wrapper space-y-4, empty state, dan scrollable container */}
        <div className="glass-card p-6 bg-[#09090b]/40 border border-white/5 rounded-xl shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="text-rose-400">
              <PieChart className="h-4 w-4 opacity-80" />
            </div>
            <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Distribusi Pengeluaran</h2>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {distribusiPengeluaran.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono text-center py-12 italic">
                Belum ada mutasi beban pengeluaran bulan ini.
              </p>
            ) : (
              distribusiPengeluaran.map((item) => {
                const style = getCategoryStyle(item.name);
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-2 text-neutral-300 font-medium">
                        <i className={`fa-solid ${style.icon} text-[10px] opacity-60`}></i>
                        {item.name}
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        {formatAbbr(item.amount, activeCurrency)}
                        <span className="text-neutral-600 ml-1">({item.persentase}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/[0.02]">
                      <div
                        className={`h-full ${style.color} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${item.persentase}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}