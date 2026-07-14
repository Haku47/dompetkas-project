import { create } from 'zustand';
import { Wallet, Transaction } from '@/types';

interface TransactionFilter {
  startDate?: string;
  endDate?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

// Interface baru untuk cetakan objek distribusi pengeluaran
interface DistribusiItem {
  name: string;
  amount: number;
  persentase: number;
}

interface TransactionState {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  wallets: Wallet[];
  transactions: Transaction[];
  trenGrafik: any[];
  distribusiPengeluaran: DistribusiItem[]; // ⚡ FITUR BARU STATE
  isLoading: boolean;
  fetchSummary: (token: string, baseCurrency?: string) => Promise<void>;
  fetchTransactions: (token: string, filters?: TransactionFilter, page?: number, baseCurrency?: string) => Promise<PaginationMeta | undefined>;
}

const API_URL = 'http://127.0.0.1:8000/api';

export const useTransactionStore = create<TransactionState>((set) => ({
  totalBalance: 0,
  totalIncome: 0,
  totalExpense: 0,
  wallets: [],
  transactions: [],
  trenGrafik: [],
  distribusiPengeluaran: [], // Default array kosong
  isLoading: false,

  fetchSummary: async (token, baseCurrency = 'IDR') => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/dashboard/summary?base_currency=${baseCurrency}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      const json = await res.json();
      
      if (json.status === 'success') {
        set({
          totalBalance: json.data?.total_kekayaan ?? 0,
          totalIncome: json.data?.arus_Kas?.pemasukan ?? 0,
          totalExpense: json.data?.arus_Kas?.pengeluaran ?? 0, 
          wallets: json.data?.daftar_dompet ?? [],
          distribusiPengeluaran: json.data?.distribusi_pengeluaran ?? [], // ⚡ SINKRON: Langsung simpan data matang dari backend
          trenGrafik: json.data?.tren_grafik ?? [],
        });
      }
    } catch (err) {
      console.error('Gagal sinkronisasi data ringkasan:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (token, filters, page = 1, baseCurrency = 'IDR') => {
    set({ isLoading: true });
    try {
      let url = `${API_URL}/transactions?page=${page}&base_currency=${baseCurrency}`;
      if (filters?.startDate && filters?.endDate) {
        url += `&start_date=${filters.startDate}&end_date=${filters.endDate}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      const json = await res.json();
      
      if (json.status === 'success') {
        set({ transactions: json.data });
        return json.meta as PaginationMeta;
      }
    } catch (err) {
      console.error('Gagal memuat jurnal transaksi:', err);
    } finally {
      set({ isLoading: false });
    }
    return undefined;
  },
}));