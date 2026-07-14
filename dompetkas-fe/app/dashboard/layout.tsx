'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, hydrateAuth, user } = useAuthStore();
  
  // 📱 STATE MOBILE SIDEBAR TOGGLE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Sinkronisasi data autentikasi saat halaman di-refresh / dimuat pertama kali
  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  // Close mobile sidebar otomatis saat pindah rute/halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 2. Keamanan Rute: Tendang balik ke halaman login jika token lokal kosong
  useEffect(() => {
    const token = localStorage.getItem('dompetkas_token');
    if (!token) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  // Mapping aman identitas akun
  const displayUsername = user?.name || (user as any)?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'pribadi@email.com';
  const initialLetter = displayUsername.charAt(0).toUpperCase();

  // 📝 RENDER KONTEN SUB-MENU SIDEBAR (Biar ga nulis 2 kali)
  const renderSidebarContent = () => (
    <>
      <div className="p-6 space-y-8">
        {/* Identitas Brand Personal */}
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-vault"></i>
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">DompetKas</span>
          </div>
          {/* Tombol Close Khusus di Layar HP */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-neutral-500 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Menu Pilihan Halaman */}
        <nav className="space-y-1">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard') 
                ? 'text-white bg-white/0.04 border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/2 border border-transparent'
            }`}
          >
            <i className="fa-solid fa-chart-pie w-4 opacity-80"></i>
            <span>Ringkasan Kas</span>
          </button>

          <button 
            onClick={() => router.push('/dashboard/dompet')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard/dompet') 
                ? 'text-white bg-white/0.04 border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/2 border border-transparent'
            }`}
          >
            <i className="fa-solid fa-wallet w-4 opacity-70"></i>
            <span>Kelola Dompet</span>
          </button>

          <button 
            onClick={() => router.push('/dashboard/transaksi')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard/transaksi') 
                ? 'text-white bg-white/0.04 border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/2 border border-transparent'
            }`}
          >
            <i className="fa-solid fa-list-check w-4 opacity-70"></i>
            <span>Riwayat Transaksi</span>
          </button>

          {/* ⚙️ FITUR BARU: Menu Pengaturan Terintegrasi */}
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard/settings') 
                ? 'text-white bg-white/0.04 border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <i className="fa-solid fa-gear w-4 opacity-70"></i>
            <span>Pengaturan</span>
          </button>
        </nav>
      </div>

      {/* Info Profil Akun & Aksi Keluar */}
      <div className="p-4 border-t border-white/5 space-y-2.5">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-xs text-neutral-200 font-semibold uppercase">
            {initialLetter}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{displayUsername}</p>
            <p className="text-[10px] text-neutral-500 truncate">{displayEmail}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400/90 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg text-left transition-all cursor-pointer"
        >
          <i className="fa-solid fa-arrow-right-from-bracket w-4"></i>
          <span>Keluar Sistem</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#000000] text-neutral-200 overflow-hidden">
      
      {/* 📱 A. BACKDROP OVERLAY & DRAWER SIDEBAR UNTUK LAYAR MOBILE/TABLET */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-white/5 bg-[#09090b] flex flex-col justify-between transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* 💻 B. PERMANENT SIDEBAR UNTUK DESKTOP (Layar Lebar) */}
      <aside className="w-64 border-r border-white/5 bg-[#09090b] flex flex-col justify-between hidden md:flex shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* 🪐 AREA KONTEN UTAMA (Sisi Kanan) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Atas: Bar Navigasi Status (Responsif) */}
        <header className="h-14 border-b border-white/5 bg-[#09090b]/40 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* 📱 HAMBURGER BUTTON: Cuma muncul di HP & Tablet */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <i className="fa-solid fa-bars text-base"></i>
            </button>
            <div className="text-[10px] font-medium text-neutral-500 font-mono tracking-wider uppercase truncate max-w-[180px] sm:max-w-none">
              Console // Operational Dashboard
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Secure Connection</span>
              <span className="sm:hidden">SECURE</span>
            </span>
          </div>
        </header>

        {/* Bawah: Tempat Berbagai Modul Halaman Dirender */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
}