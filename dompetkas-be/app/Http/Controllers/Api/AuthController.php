<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; // ✨ INI DIA YANG KETINGGALAN!
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email'=> $request->email,
            'password' => Hash::make($request->password)
        ]);

        // 💡 OTOMATISASI: Daftarkan kategori esensial langsung untuk user yang baru register ini
        $defaultCategories = [
            // Kategori Pemasukan
            ['name' => 'Gaji Pokok', 'type' => 'income'],
            ['name' => 'Passive Income', 'type' => 'income'],

            // Kategori Pengeluaran
            ['name' => 'Makanan & Minuman', 'type' => 'expense'],
            ['name' => 'Transportasi / Bensin', 'type' => 'expense'],
            ['name' => 'Uang Kopi / Jajan', 'type' => 'expense'],
        ];

        foreach ($defaultCategories as $category) {
            DB::table('categories')->insert([
                'user_id' => $user->id, 
                'name' => $category['name'],
                'type' => $category['type'],
                'budget_limit' => $category['type'] === 'expense' ? 1000000.00 : null, 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Akun DompetKas berhasil didaftarkan.',
            'token' => $user->createToken('dompetkas_token')->plainTextToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password'=> 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        // 🛡️ FIX: "Jika user TIDAK ditemukan ATAU password TIDAK cocok"
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kombinasi email dan password salah!'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'message'=> 'Autentikasi berhasil.',
            'token' => $user->createToken('dompetkas_token')->plainTextToken,
            'user' => [ 
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Sesi token berhasil dihancurkan.'
        ], 200);
    }
}