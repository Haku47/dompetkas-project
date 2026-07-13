'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // 🛠️ MAPPING AMAN USERNAME: Ambil nama asli dari database, fallback ke potongan email sebelum '@', baru ke kata 'User'
  const displayUsername = user?.name || (user as any)?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'pribadi@email.com';
  const initialLetter = displayUsername.charAt(0).toUpperCase();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#09090b] flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-6 space-y-8">
        
        {/* Identitas Brand Personal */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs">
            <i className="fa-solid fa-vault"></i>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">DompetKas</span>
        </div>

        {/* Menu Pilihan Halaman */}
        <nav className="space-y-1">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard') 
                ? 'text-white bg-white/[0.04] border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <i className="fa-solid fa-chart-pie w-4 opacity-80"></i>
            <span>Ringkasan Kas</span>
          </button>

          <button 
            onClick={() => router.push('/dashboard/dompet')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard/dompet') 
                ? 'text-white bg-white/[0.04] border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <i className="fa-solid fa-wallet w-4 opacity-70"></i>
            <span>Kelola Dompet</span>
          </button>

          <button 
            onClick={() => router.push('/dashboard/transaksi')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all cursor-pointer ${
              isActive('/dashboard/transaksi') 
                ? 'text-white bg-white/[0.04] border border-white/5 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <i className="fa-solid fa-list-check w-4 opacity-70"></i>
            <span>Riwayat Transaksi</span>
          </button>
        </nav>
      </div>

      {/* Info Profil Akun & Aksi Keluar */}
      <div className="p-4 border-t border-white/5 space-y-2.5">
        <div className="flex items-center gap-3 px-2 py-1">
          {/* ✨ Lingkaran inisial huruf otomatis berubah dinamis mengikuti nama user */}
          <div className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-xs text-neutral-200 font-semibold uppercase">
            {initialLetter}
          </div>
          <div className="truncate">
            {/* ✨ Menampilkan Username Asli dari Akun Logged In */}
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
    </aside>
  );
}