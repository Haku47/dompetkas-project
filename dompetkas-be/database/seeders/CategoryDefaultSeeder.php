<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryDefaultSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pos anggaran standar untuk mempermudah user saat pertama kali registrasi
        $defaultCategories = [
            // POS Pemasukan (Income)
            ['name' => 'Gaji Pokok', 'type' => 'income'],
            ['name' => 'Bonus / Insentif', 'type' => 'income'],
            ['name' => 'Passive income', 'type' => 'income'],
            ['name' => 'Investasi Cair', 'type' => 'income'],

            // POS Pengeluaran (Expense)
            ['name' => 'Makanan & Minuman', 'type' => 'expense'],
            ['name' => 'Transportasi / Bensin', 'type' => 'expense'],
            ['name' => 'Tagihan & Utilitas', 'type' => 'expense'],
            ['name' => 'Belanja Bulanan', 'type' => 'expense'],
            ['name' => 'Hiburan / Kesenangan', 'type' => 'expense'],
            ['name' => 'Kesehatan & Medis', 'type' => 'expense'],
            ['name' => 'Uang Kopi / Jajan', 'type' => 'expense'],
        ];

        // Ambil User pertama yang ada di database sebagai contoh default seeder
        $firstUser = DB::table('users')->first();

        if ($firstUser) {
            foreach ($defaultCategories as $category) {
                // Cek apakah kategorinya sudah ada untuk user ini supaya tidak duplikat
                $exists = DB::table('categories')
                    ->where('user_id', $firstUser->id)
                    ->where('name', $category['name'])
                    ->exists();

                if (!$exists) {
                    DB::table('categories')->insert([
                        'user_id' => $firstUser->id,
                        'name' => $category['name'],
                        'type' => $category['type'],
                        'budget_limit' => $category['type'] === 'expense' ? 1000000.00 : null, // Set budget aman default 1 juta untuk pengeluaran
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}