'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';

// Formatter abbreviasi: 1.5T, 500M, 25Jt, 500Rb
const formatAbbr = (value: number, currency: string): string => {
  const abs = Math.abs(value);

  const fmt = (num: number, suffix: string) => {
    const rounded = parseFloat(num.toFixed(1));
    const display = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${display}${suffix}`;
  };

  // Prefix simbol sesuai mata uang
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : 'Rp';

  if (abs >= 1_000_000_000_000) return `${symbol} ${fmt(value / 1_000_000_000_000, 'T')}`;
  if (abs >= 1_000_000_000)     return `${symbol} ${fmt(value / 1_000_000_000, 'M')}`;
  if (abs >= 1_000_000)         return `${symbol} ${fmt(value / 1_000_000, 'Jt')}`;
  if (abs >= 1_000)             return `${symbol} ${fmt(value / 1_000, 'Rb')}`;
  return `${symbol} ${value.toLocaleString('id-ID')}`;
};

export default function WalletPage() {
  const { token } = useAuthStore();
  const { wallets, isLoading, fetchSummary } = useTransactionStore();
  const { formatCurrency } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchSummary(token);
    }
  }, [token, fetchSummary]);

  const handleAddNominal = (value: number) => {
    const current = initialBalance ? parseFloat(initialBalance) : 0;
    setInitialBalance((current + value).toString());
  };

  const handleBalanceChange = (val: string) => {
    const cleanValue = val.replace(/[^0-9]/g, '');
    setInitialBalance(cleanValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: walletName,
          balance: initialBalance ? parseFloat(initialBalance) : 0,
          currency: currency,
        }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        await fetchSummary(token);
        setWalletName('');
        setInitialBalance('');
        setCurrency('IDR');
        setIsOpen(false);
      } else {
        setError(json.message || 'Gagal menambahkan rekening baru.');
      }
    } catch (err) {
      setError('Gagal menghubungi server database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeWallets = wallets ?? [];

  return (
    <div className="space-y-6">

      {/* HEADER SEKSI & TOMBOL AKSI */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">Kelola Akun Rekening</h1>
          <p className="text-xs text-neutral-400 font-mono">Total terdaftar: {safeWallets.length} dompet aktif</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="btn-modern-primary !py-2 !px-3.5 !rounded-lg text-xs cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          <span>Tambah Rekening</span>
        </button>
      </div>

      {/* GRID DAFTAR DOMPET */}
      {isLoading && safeWallets.length === 0 ? (
        <div className="text-center py-12 text-xs text-neutral-600 font-mono">
          Sinkronisasi daftar dompet...
        </div>
      ) : safeWallets.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-neutral-500 space-y-2">
          <i className="fa-solid fa-wallet text-xl text-neutral-700 block mb-1"></i>
          <p>Belum ada rekening atau dompet yang dikonfigurasi.</p>
          <p className="text-neutral-600">Klik tombol di kanan atas untuk membuat akun pertamamu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {safeWallets.map((wallet) => {
            const walletCurrency = wallet.currency || 'IDR';

            return (
              <div
                key={wallet.id}
                className="glass-card p-5 flex flex-col justify-between h-32 bg-[#09090b]/40 hover:bg-[#09090b]/80 transition-all duration-300 shadow-2xl border border-white/5 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-medium text-neutral-200">{wallet.name}</h3>
                    <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">ID: W-{wallet.id} // {walletCurrency}</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 text-xs">
                    <i className="fa-solid fa-credit-card text-[11px] opacity-70"></i>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">Saldo Tersedia</p>
                  {/* ✅ Pakai formatAbbr agar saldo tidak meluap di kartu kecil */}
                  <p className="text-lg font-semibold text-white font-mono tracking-tight">
                    {formatAbbr(wallet.balance, walletCurrency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POP-UP TAMBAH DOMPET */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="glass-card w-full max-w-sm p-6 bg-[#09090b] space-y-5 shadow-2xl border border-white/5 rounded-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Rekening Baru</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="p-3 text-[11px] bg-red-950/30 border border-red-900/40 text-red-400 rounded-lg flex items-center gap-2 font-mono">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide font-mono">Nama Rekening</label>
                <input
                  type="text"
                  required
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="e.g., Bank BCA, Kantong Gopay, Cash"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700 transition-colors"
                />
              </div>

              {/* MULTI-CURRENCY: Dropdown Pilihan Mata Uang */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide font-mono">Jenis Mata Uang</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer font-mono"
                >
                  <option value="IDR" className="bg-[#09090b]">Rupiah Indonesia (IDR)</option>
                  <option value="USD" className="bg-[#09090b]">United States Dollar (USD)</option>
                  <option value="JPY" className="bg-[#09090b]">Japanese Yen (JPY)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide font-mono">Saldo Awal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialBalance}
                  onChange={(e) => handleBalanceChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700 font-mono transition-colors"
                />

                {/* SHORTCUT PANEL */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleAddNominal(1000000)}
                    className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white hover:border-white/10 cursor-pointer transition-all"
                  >
                    +1 Jt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNominal(10000000)}
                    className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white hover:border-white/10 cursor-pointer transition-all"
                  >
                    +10 Jt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNominal(1000000000)}
                    className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white hover:border-white/10 cursor-pointer transition-all"
                  >
                    +1 M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNominal(1000000000000)}
                    className="py-1 bg-emerald-950/40 border border-emerald-900 rounded text-[9px] font-mono text-emerald-400 hover:bg-emerald-950/60 cursor-pointer transition-all"
                  >
                    +1 T 🚀
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-modern-secondary flex-1 !py-2 text-xs text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-modern-primary flex-1 !py-2 text-xs text-center disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner animate-spin"></i>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}