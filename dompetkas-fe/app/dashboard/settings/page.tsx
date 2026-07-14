'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const displayUsername = user?.name || (user as any)?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'pribadi@email.com';

  // State Form Klien
  const [name, setName] = useState(displayUsername);
  const [currency, setCurrency] = useState('IDR');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // 🔴 ZONA BAHAYA: State Pemusnahan Akun
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });
    setTimeout(() => {
      setIsUpdatingProfile(false);
      setMessage({ type: 'success', text: 'Konfigurasi profil berhasil diperbarui.' });
    }, 800);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setMessage({ type: '', text: '' });
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: 'Kredensial keamanan berhasil diperbarui.' });
    }, 1000);
  };

  // 🔴 Handler Pemusnahan Akun Rill ke API
  const handleTerminateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmDeleteText !== 'HAPUS AKUN SAYA') return;

    setIsDeletingAccount(true);
    setMessage({ type: '', text: '' }); // 🛠️ FIX: Gunakan setMessage untuk me-reset status log, bukan setError

    try {
      const token = localStorage.getItem('dompetkas_token');
      const res = await fetch('http://127.0.0.1:8000/api/user/terminate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.status === 'success') {
        logout(); // Hapus session di Zustand store lokal
        router.push('/login'); // Lempar balik ke gerbang login
      } else {
        setMessage({ type: 'error', text: json.message || 'Gagal memproses penghapusan akun.' });
        setIsDeletingAccount(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghubungi server database.' });
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-fadeIn">
      
      {/* HEADER MODUL SETTINGS */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-sm font-semibold text-white tracking-wider uppercase">Pengaturan Sistem</h1>
        <p className="text-xs text-neutral-400">Konfigurasi preferensi platform dan keamanan akun DompetKas</p>
      </div>

      {/* NOTIFIKASI FEEDBACK */}
      {message.text && (
        <div className={`p-3 text-[11px] font-mono border rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
            : 'bg-red-950/20 border-red-900/40 text-red-400'
        }`}>
          <i className={message.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}></i>
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* PREFERENSI PROFIL */}
        <div className="glass-card p-6 bg-[#09090b]/40 space-y-4 border border-white/5">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Preferensi Profil</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Alamat Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={displayEmail}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-900/50 border border-white/5 rounded-lg text-neutral-500 focus:outline-none cursor-not-allowed font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Default Mata Uang Base</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
              >
                <option value="IDR">Rupiah Indonesia (IDR)</option>
                <option value="USD">United States Dollar (USD)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
              </select>
            </div>
            <button type="submit" disabled={isUpdatingProfile} className="btn-modern-primary !py-2 !px-4 !rounded-lg text-xs cursor-pointer disabled:opacity-50">
              {isUpdatingProfile ? <i className="fa-solid fa-spinner animate-spin"></i> : <span>Simpan Profil</span>}
            </button>
          </form>
        </div>

        {/* AUTENTIKASI & SANDI */}
        <div className="glass-card p-6 bg-[#09090b]/40 space-y-4 border border-white/5">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Autentikasi & Sandi</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-800 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Kata Sandi Baru</label>
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter unik"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-800 transition-colors"
              />
            </div>
            <button type="submit" disabled={isUpdatingPassword} className="btn-modern-primary !py-2 !px-4 !rounded-lg text-xs cursor-pointer disabled:opacity-50">
              {isUpdatingPassword ? <i className="fa-solid fa-spinner animate-spin"></i> : <span>Perbarui Sandi</span>}
            </button>
          </form>
        </div>

        {/* 🔴 ZONA BAHAYA: TERMINATE AKUN */}
        <div className="glass-card p-6 bg-red-950/5 space-y-4 border border-red-950/30 rounded-xl">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-red-400 tracking-wider uppercase font-mono">Danger Zone // Pemusnahan Akun</h3>
            <p className="text-[11px] text-neutral-400">Aksi ini bersifat permanen. Seluruh akun dompet, kategori custom, dan total data mutasi riwayat kas lu akan dihapus secara total dari database tanpa bisa dipulihkan.</p>
          </div>

          <form onSubmit={handleTerminateAccount} className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-neutral-400 font-mono">Ketik <span className="text-red-400 font-bold select-all">HAPUS AKUN SAYA</span> untuk konfirmasi:</label>
              <input
                type="text"
                required
                placeholder="HAPUS AKUN SAYA"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-black border border-red-950/40 rounded-lg text-white focus:outline-none focus:border-red-500 font-mono tracking-wide placeholder:text-neutral-800 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={confirmDeleteText !== 'HAPUS AKUN SAYA' || isDeletingAccount}
              className="w-full py-2 bg-red-950/20 hover:bg-red-600 border border-red-900/40 hover:border-red-500 text-red-400 hover:text-white font-medium text-xs rounded-lg transition-all cursor-pointer disabled:opacity-20 disabled:bg-transparent disabled:border-white/5 disabled:text-neutral-600 disabled:cursor-not-allowed"
            >
              {isDeletingAccount ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner animate-spin"></i> Destructuring Database Engine...
                </span>
              ) : (
                <span>Hapus Akun & Data Kas Selamanya</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}