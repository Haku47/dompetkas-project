import { useState, useEffect } from 'react';

export function useCurrency() {
  const [baseCurrency, setBaseCurrency] = useState('IDR');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dompetkas_currency') || 'IDR';
      setBaseCurrency(saved.toUpperCase());
    }
  }, []);

  // ⚡ FIX MUTLAK: Mendukung override mata uang dompet asal (currencyCode)
  const formatCurrency = (value: number | string, currencyCode?: string) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return '0';

    // Gunakan currencyCode dompet jika ada, kalau tidak ada baru pakai global baseCurrency
    const activeCode = (currencyCode || baseCurrency).toUpperCase();

    let locale = 'id-ID';
    if (activeCode === 'USD') locale = 'en-US';
    if (activeCode === 'JPY') locale = 'ja-JP';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: activeCode,
      minimumFractionDigits: activeCode === 'IDR' || activeCode === 'JPY' ? 0 : 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  return { formatCurrency, baseCurrency };
}