'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTransactionStore } from '@/stores/useTransactionStore';

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

// Tipe kategori dari API
interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export default function TransactionPage() {
  const { token } = useAuthStore();
  const {
    transactions,
    wallets,
    isLoading,
    fetchTransactions,
    fetchSummary
  } = useTransactionStore();

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday'>('today');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ✅ State kategori dinamis dari API
  const [categories, setCategories] = useState<Category[]>([]);

  // ✅ Fetch kategori milik user saat mount
  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(json => { if (json.status === 'success') setCategories(json.data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (token) {
      const loadData = async () => {
        const meta = await (fetchTransactions as any)(token, { startDate: filterStartDate, endDate: filterEndDate }, currentPage);
        if (meta) {
          setCurrentPage(meta.current_page);
          setLastPage(meta.last_page);
          setTotalItems(meta.total);
        }
      };
      loadData();
      fetchSummary(token);
    }
  }, [token, fetchTransactions, fetchSummary, filterStartDate, filterEndDate, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStartDate, filterEndDate]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    const firstWord = text.trim().split(' ')[0].toLowerCase();

    const incomeKeywords = [
      'gaji', 'jual', 'bonus', 'cuan', 'dapat', 'terima', 'income', 'profit',
      'gajian', 'investasi', 'dividen', 'klaim', 'refund', 'kembalian', 'hibah',
      'hadiah', 'menang', 'cair', 'pencairan', 'saham', 'crypto', 'thr'
    ];
    const expenseKeywords = [
      'beli', 'bayar', 'makan', 'minum', 'jajan', 'kopi', 'sewa', 'cicil',
      'cicilan', 'langganan', 'subs', 'grab', 'gojek', 'ojek', 'bensin', 'parkir',
      'tol', 'nonton', 'travel', 'tiket', 'belanja', 'borong', 'donasi', 'sedekah',
      'zakat', 'pajak', 'pulsa', 'kuota', 'token', 'listrik', 'air', 'wifi',
      'laundry', 'ongkir', 'kirim', 'transfer', 'tombok', 'rugi', 'denda'
    ];

    if (incomeKeywords.includes(firstWord)) setType('income');
    else if (expenseKeywords.includes(firstWord)) setType('expense');
  };

  const handleAddNominal = (value: number) => {
    const current = amount ? parseFloat(amount) : 0;
    setAmount((current + value).toString());
  };

  const getSelectedTransactionDate = () => {
    const targetDate = new Date();
    if (dateMode === 'yesterday') targetDate.setDate(targetDate.getDate() - 1);
    return targetDate.toISOString().split('T')[0];
  };

  // ✅ Fungsi cari category_id berdasarkan nama kategori user + keyword
  const resolveCategoryId = (firstWord: string): number => {
    const pool = categories.filter(c => c.type === type);

    const keywordMap: Record<string, string[]> = type === 'income'
      ? {
          'gaji':     ['gaji', 'gajian', 'salary'],
          'bonus':    ['bonus', 'insentif', 'thr', 'hadiah'],
          'passive':  ['passive', 'dividen', 'saham', 'crypto'],
          'investasi':['investasi', 'cair', 'pencairan'],
        }
      : {
          'makanan':      ['makan', 'minum', 'warung', 'resto', 'nasi'],
          'transportasi': ['ojek', 'grab', 'gojek', 'bensin', 'parkir', 'tol', 'travel', 'tiket', 'denda', 'tilang', 'parkir', 'kereta', 'kereta api', 'pesawat', 'travel'],
          'tagihan':      ['listrik', 'air', 'wifi', 'token', 'pulsa', 'kuota', 'tagihan'],
          'belanja':      ['beli', 'belanja', 'borong', 'shopee', 'tokopedia'],
          'hiburan':      ['nonton', 'game', 'langganan', 'subs', 'netflix', 'spotify'],
          'kesehatan':    ['obat', 'dokter', 'klinik', 'apotek'],
          'kopi':         ['kopi', 'jajan', 'snack', 'cafe'],
        };

    for (const [catKeyword, words] of Object.entries(keywordMap)) {
      if (words.includes(firstWord)) {
        // Cari kategori user yang namanya mengandung keyword tersebut
        const matched = pool.find(c => c.name.toLowerCase().includes(catKeyword));
        if (matched) return matched.id;
      }
    }

    // Fallback: kategori pertama sesuai tipe milik user
    const lainnya = pool.find(c => c.name.toLowerCase().includes('lain'));
    return lainnya?.id ?? pool[0]?.id ?? 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !walletId) return;

    setError('');
    setIsSubmitting(true);

    const firstWord = description.trim().split(' ')[0].toLowerCase();
    // ✅ Tidak ada lagi hardcoded ID — semuanya dinamis dari kategori user
    const calculatedCategoryId = resolveCategoryId(firstWord);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_id: parseInt(walletId),
          category_id: calculatedCategoryId,
          amount: parseFloat(amount),
          type: type,
          description: description || null,
          transaction_date: getSelectedTransactionDate(),
        }),
      });

      const json = await res.json();

      if (json.status === 'success') {
        setCurrentPage(1);
        setWalletId('');
        setAmount('');
        setDescription('');
        setDateMode('today');
        setIsOpen(false);
        // Refresh data setelah catat transaksi baru
        fetchSummary(token);
      } else {
        setError(json.message || 'Gagal menyimpan transaksi baru.');
      }
    } catch (err) {
      setError('Gagal menghubungi server database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeTransactions = transactions ?? [];
  const safeWallets = wallets ?? [];

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= lastPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-2.5 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
            currentPage === i
              ? 'bg-white text-black border-white font-bold'
              : 'bg-transparent border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold text-white tracking-wider uppercase">Jurnal Riwayat Kas</h1>
          <p className="text-xs text-neutral-400">Total arsip mutasi: {totalItems} catatan ditemukan</p>
        </div>

        <div className="flex items-center gap-3 bg-[#09090b] px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-center">
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="bg-transparent text-xs font-mono text-neutral-300 focus:outline-none [color-scheme:dark] cursor-pointer"
          />
          <span className="text-neutral-600 font-mono text-[10px] uppercase">s/d</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="bg-transparent text-xs font-mono text-neutral-300 focus:outline-none [color-scheme:dark] cursor-pointer"
          />
          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
              className="text-[10px] text-red-400 hover:text-red-300 font-mono pl-1 border-l border-white/10 cursor-pointer"
            >
              RESET
            </button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="btn-modern-primary py-2! px-3.5! rounded-lg! text-xs cursor-pointer self-end sm:self-center"
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          <span>Catat Mutasi</span>
        </button>
      </div>

      {/* TABEL */}
      {isLoading && safeTransactions.length === 0 ? (
        <div className="text-center py-12 text-xs text-neutral-600 font-mono">
          Menyusun log riwayat kas...
        </div>
      ) : safeTransactions.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-neutral-500 space-y-2">
          <i className="fa-solid fa-list-check text-xl text-neutral-700 block mb-1"></i>
          <p>Belum ada catatan mutasi kas masuk atau keluar pada periode ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="responsive-table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/1 text-[10px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Deskripsi</th>
                    <th className="py-3.5 px-4">Rekening</th>
                    <th className="py-3.5 px-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {safeTransactions.map((tx) => {
                    const isIncomeTx = tx.category?.type === 'income' || (tx as any).type === 'income';
                    const walletCurrency = (tx.wallet as any)?.currency || 'IDR';
                    return (
                      <tr key={tx.id} className="hover:bg-white/1 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-neutral-400">
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
                          {isIncomeTx ? '+' : '-'} {formatAbbr(tx.amount, walletCurrency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between bg-[#09090b]/40 px-4 py-3 border border-white/5 rounded-xl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-white/5 border border-white/5 rounded text-xs text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer transition-all font-mono"
              >
                PREV
              </button>
              <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                className="px-3 py-1 bg-white/5 border border-white/5 rounded text-xs text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer transition-all font-mono"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-sm p-6 bg-[#09090b] space-y-5 shadow-2xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-semibold text-white tracking-wider uppercase">Pencatatan Baru</h2>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer">
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
                  <button type="button" onClick={() => setType('expense')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      type === 'expense' ? 'bg-red-950/20 border-red-900 text-red-400 font-semibold' : 'bg-black border-white/10 text-neutral-400'
                    }`}>
                    Pengeluaran (-)
                  </button>
                  <button type="button" onClick={() => setType('income')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      type === 'income' ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400 font-semibold' : 'bg-black border-white/10 text-neutral-400'
                    }`}>
                    Pemasukan (+)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Waktu Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setDateMode('today')}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      dateMode === 'today' ? 'bg-white/10 border-white/20 text-white font-semibold' : 'bg-black border-white/5 text-neutral-500'
                    }`}>
                    Hari Ini
                  </button>
                  <button type="button" onClick={() => setDateMode('yesterday')}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      dateMode === 'yesterday' ? 'bg-white/10 border-white/20 text-white font-semibold' : 'bg-black border-white/5 text-neutral-500'
                    }`}>
                    Kemarin
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Pilih Rekening</label>
                <select required value={walletId} onChange={(e) => setWalletId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer">
                  <option value="" disabled>-- Pilih Akun Dompet --</option>
                  {safeWallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#09090b]">
                      {w.name} ({formatAbbr(w.balance, (w as any).currency || 'IDR')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Nominal Uang</label>
                <input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 font-mono transition-colors" />
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  <button type="button" onClick={() => handleAddNominal(1000000)} className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer">+1 Jt</button>
                  <button type="button" onClick={() => handleAddNominal(10000000)} className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer">+10 Jt</button>
                  <button type="button" onClick={() => handleAddNominal(1000000000)} className="py-1 bg-white/5 border border-white/5 rounded text-[9px] font-mono text-neutral-400 hover:text-white cursor-pointer">+1 M</button>
                  <button type="button" onClick={() => handleAddNominal(1000000000000)} className="py-1 bg-emerald-950/40 border border-emerald-900 rounded text-[9px] font-mono text-emerald-400 cursor-pointer">+1 T 🚀</button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">Keterangan / Deskripsi</label>
                <input type="text" value={description} onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="e.g., Beli Kopi Sore, Gaji Bulanan"
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-700 transition-colors" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="btn-modern-secondary flex-1 py-2! text-xs text-center cursor-pointer">Batal</button>
                <button type="submit" disabled={isSubmitting} className="btn-modern-primary flex-1 py-2! text-xs text-center disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : <span>Catat</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}