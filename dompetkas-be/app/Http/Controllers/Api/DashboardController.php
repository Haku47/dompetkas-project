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

        $baseCurrency = strtoupper($request->query('base_currency', 'IDR'));

        $rates = ['IDR' => 1, 'USD' => 15000, 'JPY' => 100];
        $baseRate = $rates[$baseCurrency] ?? 1;

        $wallets = Wallet::where('user_id', $user->id)->get();

        $totalSaldo = $wallets->sum(function ($wallet) use ($rates, $baseRate) {
            $currency = strtoupper($wallet->currency ?? 'IDR');
            $walletRate = $rates[$currency] ?? 1;
            return ($wallet->balance * $walletRate) / $baseRate;
        });

        $currentMonth = now()->month;
        $currentYear  = now()->year;

        $monthTransactions = Transaction::where('user_id', $user->id)
            ->whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear)
            ->with(['wallet', 'category'])
            ->get();

        $pemasukan            = 0;
        $pengeluaran          = 0;
        $distribusiRaw        = [];
        $totalBebanPengeluaran = 0;

        foreach ($monthTransactions as $tx) {
            // Skip transaksi yang tidak punya kategori
            if (!$tx->category) continue;

            $walletCurrency = strtoupper($tx->wallet->currency ?? 'IDR');
            $walletRate     = $rates[$walletCurrency] ?? 1;
            $amountInBase   = ($tx->amount * $walletRate) / $baseRate;

            if ($tx->category->type === 'income') {
                $pemasukan += $amountInBase;

            } elseif ($tx->category->type === 'expense') {
                $pengeluaran          += $amountInBase;
                $totalBebanPengeluaran += $amountInBase;

                $catName = $tx->category->name ?? 'Lainnya';
                $distribusiRaw[$catName] = ($distribusiRaw[$catName] ?? 0) + $amountInBase;
            }
        }

        $distribusiPengeluaran = collect($distribusiRaw)
            ->map(function ($amount, $name) use ($totalBebanPengeluaran) {
                return [
                    'name'       => $name,
                    'amount'     => (float) $amount,
                    'persentase' => $totalBebanPengeluaran > 0
                        ? (int) round(($amount / $totalBebanPengeluaran) * 100)
                        : 0,
                ];
            })
            ->sortByDesc('amount')
            ->values()
            ->all();

        // Grafik tren tahunan
        $yearTransactions = Transaction::where('user_id', $user->id)
            ->whereYear('transaction_date', $currentYear)
            ->with(['wallet', 'category'])
            ->get();

        $trenGrafik = collect(range(1, 12))->map(function ($m) use ($yearTransactions, $rates, $baseRate) {
            $bulk = $yearTransactions->filter(
                fn($tx) => $tx->category && date('n', strtotime($tx->transaction_date)) == $m
            );

            $masuk = $bulk
                ->filter(fn($tx) => $tx->category->type === 'income')
                ->sum(function ($tx) use ($rates, $baseRate) {
                    $rate = $rates[strtoupper($tx->wallet->currency ?? 'IDR')] ?? 1;
                    return ($tx->amount * $rate) / $baseRate;
                });

            $keluar = $bulk
                ->filter(fn($tx) => $tx->category->type === 'expense')
                ->sum(function ($tx) use ($rates, $baseRate) {
                    $rate = $rates[strtoupper($tx->wallet->currency ?? 'IDR')] ?? 1;
                    return ($tx->amount * $rate) / $baseRate;
                });

            return ['bulan' => (int) $m, 'masuk' => (float) $masuk, 'keluar' => (float) $keluar];
        })->values();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'base_currency'          => $baseCurrency,
                'total_kekayaan'         => (float) $totalSaldo,
                'arus_Kas'               => [
                    'pemasukan'  => (float) $pemasukan,
                    'pengeluaran'=> (float) $pengeluaran,
                    'bersih'     => (float) ($pemasukan - $pengeluaran),
                ],
                'daftar_dompet'          => $wallets,
                'distribusi_pengeluaran' => $distribusiPengeluaran,
                'tren_grafik'            => $trenGrafik,
            ],
        ], 200);
    }
}