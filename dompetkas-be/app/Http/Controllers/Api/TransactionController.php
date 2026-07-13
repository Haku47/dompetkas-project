<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTransactionRequest;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // 🛠️ FIX #1: Huruf "I" Kapital Anti-Error Not Found!

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::with(['wallet', 'category'])
            ->where('user_id', $request->user()->id)
            ->orderBy('transaction_date', 'desc')
            ->get();

        // 🛠️ FIX #2: Diubah dari 'date' menjadi 'data' agar match dengan useTransactionStore frontend
        return response()->json(['status' => 'success', 'data' => $transactions]);
    }

public function store(StoreTransactionRequest $request)
{
    return DB::transaction(function () use ($request) {
        $wallet = Wallet::where('id', $request->wallet_id)
                        ->where('user_id', $request->user()->id)
                        ->firstOrFail();

        // 🛠️ FIX #1: Cari ID kategori asli di DB yang sesuai dengan user ini dan tipenya ('income'/'expense')
        $category = DB::table('categories')
                        ->where('user_id', $request->user()->id)
                        ->where('type', $request->type) // Mencari berdasarkan tombol 'income'/'expense' dari Next.js
                        ->first();

        // Fallback aman jika kategori bawaan user belum terbentuk
        $categoryId = $category ? $category->id : ($request->type === 'income' ? 1 : 3);
        $categoryType = $category ? $category->type : $request->type;

        // Jika pengeluaran, lakukan pengecekan saldo
        if ($categoryType === 'expense' && $wallet->balance < $request->amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi ditolak! Saldo pada dompet ini tidak mencukupi.'
            ], 400);
        }

        // Buat baris log mutasi jurnal
        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'wallet_id' => $request->wallet_id,
            'category_id' => $categoryId, // 🛠️ FIX #2: Pakai ID hasil pencarian pintar di atas
            'amount' => $request->amount,
            'description' => $request->description,
            'transaction_date' => $request->transaction_date
        ]);

        // Sesuaikan nilai saldo dompet rill
        if ($categoryType === 'income') {
            $wallet->increment('balance', $request->amount);
        } else {
            $wallet->decrement('balance', $request->amount);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dibukukan.',
            'data' => $transaction->load(['wallet', 'category'])
        ], 201);
    });
    }
}