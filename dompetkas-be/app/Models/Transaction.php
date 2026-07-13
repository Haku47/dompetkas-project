<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'amount',
        'description',
        'transaction_date'
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category(): BelongsTo
    {
        return $this->BelongsTo(Category::class);
    }
}
