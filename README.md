# 🪐 DompetKas — Modern Suite (Monorepo)

Aplikasi pembukuan dan manajemen keuangan pribadi kelas industrial dengan arsitektur terpisah (Decoupled Architecture), dibangun menggunakan ekosistem mutakhir Next.js untuk frontend dan Laravel API untuk backend.

---

## 📂 Struktur Repositori

Proyek ini dikelola menggunakan struktur Monorepo tunggal:
* **`dompetkas-be/`** — Backend Engine berbasis Laravel 11/12 RESTful API.
* **`dompetkas-fe/`** — Frontend Console berbasis Next.js 15 (App Router) & Tailwind CSS v4.

---

## 🛠️ Stack Teknologi & Fitur Utama

### 💻 Sisi Frontend (`dompetkas-fe`)
* **Next.js (App Router) + TypeScript** — Performa instan tanpa reload halaman.
* **Tailwind CSS v4** — Desain antarmuka *ultra-dark* minimalis premium.
* **Zustand Store** — Manajemen *state* otentikasi dan riwayat mutasi global.
* **Responsive Mobile & Tablet Drawer** — Akses penuh dasbor via layar sentuh HP.
* **Quick Value Entry Shortcuts** — Tombol instan penambah nominal digit jumbo (+1 Jt, +1 M, +1 T).

### 💾 Sisi Backend (`dompetkas-be`)
* **Laravel RESTful API** — Pengolah logika data, transaksi, dan keamanan.
* **Laravel Sanctum** — Keamanan otentikasi berbasis Token bearer terlindungi.
* **Database Transactions** — Pengamanan aliran saldo rekening anti-kacau via `DB::transaction`.

---

## 🚀 Cara Menjalankan di Lokal (Development)
---
### 1. Konfigurasi Backend (Laravel)
---
```bash
cd dompetkas-be
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
Backend akan berjalan di alamat https://127.0.0.1:8000

### 2.Konfigurasi Frontend (Next.js)
---
```bash
cd dompetkas-fe
npm install
npm run dev
```
Frontend akan berjalan di alamat https://localhost:3000

## 📝 Catatan Proyek
Proyek ini dibuat sebagai pembelajaran implementasi integrasi Next.js Fullstack dengan Laravel API, mengedepankan efisiensi UX input data serta responsivitas layout visual.
---
