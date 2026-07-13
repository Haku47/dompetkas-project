'use client'; // <-- WAJIB DI BARIS PALING ATAS!

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hydrateAuth } = useAuthStore();

  // Sinkronisasi sesi login saat mendarat di landing page
  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-200 flex flex-col justify-between selection:bg-white/10 selection:text-white">
      
      {/* 🌐 1. MINIMALIST NAVBAR */}
      <header className="w-full max-w-6xl mx-auto h-20 px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs">
            <i className="fa-solid fa-vault"></i>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">DompetKas</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-3.5 py-1.5 rounded-lg border border-emerald-900 bg-emerald-950/20 text-emerald-400 font-mono text-[11px] font-semibold cursor-pointer hover:bg-emerald-950/40 transition-all"
            >
              CONSOLE // OPEN
            </button>
          ) : (
            <>
              <button 
                onClick={() => router.push('/login')}
                className="text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Masuk
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="px-3 py-1.5 text-xs font-medium text-black bg-white rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Daftar Baru
              </button>
            </>
          )}
        </div>
      </header>

      {/* 🚀 2. HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-20 text-center space-y-10">
        
        {/* Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[10px] font-mono text-neutral-400 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          PLATFORM ENGINE v1.0.0 RUNNING
        </div>

        {/* Headline Utama */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none max-w-2xl mx-auto">
            Kendalikan Arus Finansial Pribadi Tanpa Batas.
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Catat jurnal mutasi kas, kelola multi-rekening dompet fisik maupun digital, serta awasi limit anggaran bulanan dalam satu konsol minimalis.
          </p>
        </div>

        {/* Akses Utama Center Tombol */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto">
          {isAuthenticated ? (
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn-modern-primary w-full text-center cursor-pointer !py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Kembali Ke Dashboard Utama</span>
              <i className="fa-solid fa-arrow-right text-[10px] opacity-70"></i>
            </button>
          ) : (
            <>
              <button 
                onClick={() => router.push('/register')}
                className="btn-modern-primary flex-1 text-center cursor-pointer !py-2.5 text-xs font-semibold"
              >
                Mulai Sekarang
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="btn-modern-secondary flex-1 cursor-pointer !py-2.5 text-xs"
              >
                Gunakan Akun
              </button>
            </>
          )}
        </div>

        {/* 📊 3. FEATURE HIGHLIGHT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-12 text-left">
          
          <div className="glass-card p-5 space-y-2 bg-[#09090b]/20">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Jurnal Mutasi Kas</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Catatan log pengeluaran dan pemasukan kas secara instan terikat waktu riil.
            </p>
          </div>

          <div className="glass-card p-5 space-y-2 bg-[#09090b]/20">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Multi-Rekening</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Pantau saldo terpisah untuk dompet tunai, e-wallet, hingga rekening bank bankir.
            </p>
          </div>

          <div className="glass-card p-5 space-y-2 bg-[#09090b]/20">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Proteksi Anggaran</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Sistem pintar otomatisasi penolakan transaksi jika melampaui limit saldo rekening rill.
            </p>
          </div>

        </div>

      </main>

      {/* 📄 4. FOOTER */}
      <footer className="w-full max-w-6xl mx-auto h-16 px-6 flex items-center justify-between border-t border-white/5 text-[10px] font-mono text-neutral-600">
        <div>© 2026 DOMPETKAS CORP. ALL RIGHTS RESERVED.</div>
        <div className="hidden sm:block">PERSONAL INTEGRITY SOFTWARE // EDITION VER 1.0.0</div>
      </footer>

    </div>
  );
}