'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth, isAuthenticated, hydrateAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Cek sesi saat komponen dibuat
    useEffect(() => {
        hydrateAuth();
    }, [hydrateAuth]);

    // Jika sudah login, langsung lempar ke dashboard
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (json.status === 'success') {
                // Simpan data user & token ke Zustand dan Local Storage
                setAuth({ id: json.user_id || 1, name: json.name || 'User', email }, json.token);
                router.push('/dashboard');
            } else {
                setError(json.message || 'Email atau password salah.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server backend.');
        } finally {
            setIsLoading(false);
        }
    };

return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#000000]">
        <div className="max-w-sm w-full glass-card p-8 space-y-6">
        
        {/* Header Form */}
        <div className="space-y-1">
            <h1 className="text-xl font-semibold text-white tracking-tight">Selamat Datang</h1>
            <p className="text-xs text-neutral-400">Masuk untuk mengelola pembukuan pribadi Anda.</p>
        </div>

        {/* Notifikasi Error */}
        {error && (
        <div className="p-3 text-xs bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-sm"></i>
            <span>{error}</span>
        </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Alamat Email</label>
            <div className="relative flex items-center">
            <i className="fa-solid fa-envelope absolute left-3.5 text-xs text-neutral-500"></i>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-900/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 transition-colors"
            />
            </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Kata Sandi</label>
            <div className="relative flex items-center">
            <i className="fa-solid fa-lock absolute left-3.5 text-xs text-neutral-500"></i>
            <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-900/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600 transition-colors"
            />
            </div>
        </div>

        <button
            type="submit"
            disabled={isLoading}
            className="btn-modern-primary w-full text-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
            ) : (
            <>
                <span>Masuk Sistem</span>
                <i className="fa-solid fa-arrow-right-to-bracket text-xs opacity-70"></i>
            </>
            )}
        </button>
        </form>

        {/* Switch ke Register */}
        <div className="text-center pt-2">
        <p className="text-xs text-neutral-500">
            Belum punya akun?{' '}
            <span 
            onClick={() => router.push('/register')}
            className="text-white font-medium hover:underline cursor-pointer"
            >
            Daftar sekarang
            </span>
        </p>
        </div>

    </div>
    </main>
    );
}