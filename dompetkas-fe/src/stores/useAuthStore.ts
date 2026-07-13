import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    hydrateAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        localStorage.setItem('dompetkas_token', token);
        localStorage.setItem('dompetkas_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('dompetkas_token');
        localStorage.removeItem('dompetkas_user');
        set({ user: null, token: null, isAuthenticated: false});
    },

    hydrateAuth: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('dompetkas_token');
            const userString = localStorage.getItem('dompetkas_user');
            
            if (token && userString) {
                try {
                    // 🛠️ Proteksi parsing JSON agar aman dari amukan compiler Next.js
                    const parsedUser = JSON.parse(userString);
                    set({
                        token,
                        user: parsedUser,
                        isAuthenticated: true,
                    });
                } catch (err) {
                    console.error("Gagal melakukan sinkronisasi data user:", err);
                }
            }
        }
    }
}));