'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';

export default function TransactionPage() {
  const { token } = useAuthStore();
  const { transactions, wallets, isLoading, fetchTransactions, fetchSummary } = useTransactionStore();
  const { formatIDR } = useCurrency();

  // State untuk Kontrol Modal Form Transaksi
  const [isOpen, setIsOpen] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sinkronisasi data mutasi kas saat halaman diakses
  useEffect(() => {
    if (token) {
      fetchTransactions(token);
      fetchSummary(token); // Diperlukan untuk drop-down pilihan dompet
    }
  }, [token, fetchTransactions, fetchSummary]);

  // 🛠️ FUNGSIONAL PINTASAN DIGIT: Menambahkan nominal instan ke dalam formulir mutasi
  const handleAddNominal = (value: number) => {
    const current = amount ? parseFloat(amount) : 0;
    setAmount((current + value).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !walletId) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_id: parseInt(walletId),
          category_id: type === 'income' ? 1 : 2, // Umpan formalitas biar lolos StoreTransactionRequest Laravel!
          amount: parseFloat(amount),
          type: type, // Dikirim ke backend pintar kita untuk dioverwrite kriteria aslinya
          description: description || null,
          transaction_date: new Date().toISOString().split('T')[0], // Tanggal hari ini YYYY-MM-DD
        }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        await fetchTransactions(token);
        await fetchSummary(token);
        
        setWalletId('');
        setAmount('');
        setDescription('');
        setIsOpen(false);
      } else {
        setError(json.message || 'Gagal menyimpan transaksi baru.');
      }
    } catch (err) {
      setError('Gagal menghubungi server database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Amankan data transactions dengan fallback array kosong jika bernilai undefined/null
  const safeTransactions = transactions ?? [];
  const safeWallets = wallets ?? [];

  return (
    <div className="space-y-6">
      
      {/* 📄 HEADER MODUL & TOMBOL INPUT MUTASI */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold text-white tracking-wider uppercase">Jurnal Riwayat Kas</h1>
          <p className="text-xs text-neutral-400">Arsip mutasi pengeluaran dan pemasukan pribadi</p>
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-modern-primary py-2! px-3.5! rounded-lg! text-xs cursor-pointer"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          <span>Catat Mutasi</span>
        </button>
      </div>

      {/* 🧾 TABEL MUTASI KAS */}
      {isLoading && safeTransactions.length === 0 ? (
        <div className="text-center py-12 text-xs text-neutral-600 font-mono">
          Menyusun log riwayat kas...
        </div>
      ) : safeTransactions.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-neutral-500 space-y-2">
          <i className="fa-solid fa-list-check text-xl text-neutral-700 block mb-1"></i>
          <p>Belum ada catatan mutasi kas masuk atau keluar.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="responsive-table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/1 text-[10px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Deskripsi</th>
                  <th className="py-3.5 px-4">Rekening</th>
                  <th className="py-3.5 px-4 text-right">Jumlah (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {safeTransactions.map((tx) => {
                  // ✨ Proteksi & Pengecekan tipe mutasi via relasi category atau kolom type (as any)
                  const isIncomeTx = tx.category?.type === 'income' || (tx as any).type === 'income';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-white/1 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        {/* 🛠️ FIX DATE: Potong stamp ISO biar jadi YYYY-MM-DD bersih */}
                        {tx.transaction_date ? tx.transaction_date.split('T')[0] : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        {tx.description || <span className="text-neutral-600 italic">Tanpa keterangan</span>}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                          {tx.wallet?.name || `Dompet #${tx.wallet_id}`}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-semibold ${
                        isIncomeTx ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isIncomeTx ? '+' : '-'} {formatIDR(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🛎️ MODAL POP-UP CATAT MUTASI */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 bg-brand-panel space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-semibold text-white tracking-wider uppercase">Pencatatan Baru</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {error && (
              <div className="p-3 text-[11px] bg-red-950/30 border border-red-900/40 text-red-400 rounded-lg flex items-center gap-2 font-mono">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Tipe Aliran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      type === 'expense'
                        ? 'bg-red-950/20 border-red-900 text-red-400 font-semibold'
                        : 'bg-black border-white/10 text-neutral-400'
                    }`}
                  >
                    Pengeluaran (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      type === 'income'
                        ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400 font-semibold'
                        : 'bg-black border-white/10 text-neutral-400'
                    }`}
                  >
                    Pemasukan (+)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Pilih Rekening</label>
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Akun Dompet --</option>
                  {safeWallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-brand-panel">
                      {w.name} ({formatIDR(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Nominal Uang (Rp)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 font-mono transition-colors"
                />

                {/* 🚀 FIX PANEL: Shortcut nominal instan biar ga pusing ngitung nol pas isi 1 Triliun */}
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Beli Kopi Sore, Gaji Bulanan"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700 transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-modern-secondary flex-1 py-2! text-xs text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-modern-primary flex-1 py-2! text-xs text-center disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner animate-spin"></i>
                  ) : (
                    <span>Catat</span>
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