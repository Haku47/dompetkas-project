<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('name'); // (e.g 'Bank BCA', 'Dompet Tunai', 'Gopay')
            $table->decimal('balance', 15, 2)->default(0.00);
            
            // 🌍 FITUR MULTI-CURRENCY: Tambah kolom mata uang (e.g., 'IDR', 'USD', 'JPY')
            $table->string('currency', 3)->default('IDR');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};