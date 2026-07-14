<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTransactionRequest;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['wallet', 'category'])
            ->where('user_id', $request->user()->id);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('transaction_date', [
                $request->query('start_date') . ' 00:00:00',
                $request->query('end_date') . ' 23:59:59'
            ]);
        }

        // ⚡ UPDATE: Pakai paginate(10) untuk memecah halaman di database
        $paginatedTransactions = $query->orderBy('transaction_date', 'desc')->paginate(10);

        // 🛠️ FIX RESPONSE: Sertakan data item dan meta agar dibaca mulus oleh halaman nomor di frontend
        return response()->json([
            'status' => 'success', 
            'data' => $paginatedTransactions->items(),
            'meta' => [
                'current_page' => $paginatedTransactions->currentPage(),
                'last_page' => $paginatedTransactions->lastPage(),
                'total' => $paginatedTransactions->total()
            ]
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $wallet = Wallet::where('id', $request->wallet_id)
                            ->where('user_id', $request->user()->id)
                            ->firstOrFail();

            $category = DB::table('categories')
                            ->where('user_id', $request->user()->id)
                            ->where('type', $request->type)
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
                'category_id' => $categoryId,
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

            // Return response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dibukukan.',
                'data' => $transaction->load(['wallet', 'category'])
            ], 201);
        });
    }
}