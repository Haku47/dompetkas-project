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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name'); // e.g 'Makanan', 'Gaji bulanan', 'Uang Kopi'
            $table->enum('type', ['income', 'expense']); // Jenis kas masuk atau keluar
            $table->decimal('budget_limit', 15, 2)->nullable(2); // Batas aman penggunaan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
