import { create } from 'zustand';
import { Wallet, Transaction } from '@/types';

interface TransactionState {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  wallets: Wallet[];
  transactions: Transaction[];
  isLoading: boolean;
  fetchSummary: (token: string) => Promise<void>;
  fetchTransactions: (token: string) => Promise<void>;
}

const API_URL = 'http://127.0.0.1:8000/api';

export const useTransactionStore = create<TransactionState>((set) => ({
  totalBalance: 0,
  totalIncome: 0,
  totalExpense: 0,
  wallets: [],
  transactions: [],
  isLoading: false,

  // 1. Menarik ringkasan saldo total & grid daftar rekening
  fetchSummary: async (token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/dashboard/summary`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      const json = await res.json();
      
      if (json.status === 'success') {
        // 🛠️ FIX MAPPING: Menyelaraskan dengan struktur objek bahasa Indonesia dari backend asli lu
        set({
          totalBalance: json.data?.total_kekayaan ?? 0,
          totalIncome: json.data?.arus_Kas?.pemasukan ?? 0, // ✨ Masuk ke objek arus_Kas
          totalExpense: json.data?.arus_Kas?.pengeluaran ?? 0, // ✨ Masuk ke objek arus_Kas
          wallets: json.data?.daftar_dompet ?? [],
        });
      }
    } catch (err) {
      console.error('Gagal sinkronisasi data ringkasan:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. Menarik seluruh jurnal riwayat transaksi/mutasi kas
  fetchTransactions: async (token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      const json = await res.json();
      
      if (json.status === 'success') {
        set({ transactions: json.data });
      }
    } catch (err) {
      console.error('Gagal memuat jurnal transaksi:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));