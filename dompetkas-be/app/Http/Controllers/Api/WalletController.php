<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreWalletRequest;
use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => Wallet::where('user_id', $request->user()->id)->get()
        ]);
    }

    public function store(StoreWalletRequest $request)
    {
        $wallet = Wallet::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'balance' => $request->balance ?? 0.00
        ]);

        return response()->json(['status' => 'success', 'data' => $wallet], 201);
    }
}