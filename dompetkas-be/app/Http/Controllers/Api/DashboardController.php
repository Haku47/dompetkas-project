<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();

        $wallets = Wallet::where('user_id', $user->id)->get();
        $totalSaldo = $wallets->sum('balance');

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $pemasukan = Transaction::where('user_id', $user->id)
        ->whereMonth('transaction_date', $currentMonth)
        ->whereYear('transaction_date', $currentYear)
        ->whereHas('category', fn($q) => $q->where('type', 'income'))
        ->sum('amount');

        $pengeluaran = Transaction::where('user_id', $user->id)
        ->whereMonth('transaction_date', $currentMonth)
        ->whereYear('transaction_date', $currentYear)
        ->whereHas('category', fn($q) => $q->where('type', 'expense'))
        ->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_kekayaan' => (float) $totalSaldo,
                'arus_Kas' => [
                    'pemasukan' => (float) $pemasukan,
                    'pengeluaran' => (float) $pengeluaran,
                    'bersih' => (float) ($pemasukan - $pengeluaran)
                ],
                'daftar_dompet' => $wallets
            ]
        ], 200);
    }
}
