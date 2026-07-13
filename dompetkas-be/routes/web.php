<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Rute ini hanya bertindak sebagai indikator/fallback diagnostik server saja.
| Seluruh core data diproses melalui file routes/api.php.
|
*/

Route::get('/', function () {
    return response()->json([
        'node_status' => 'OPERATIONAL',
        'engine' => 'Laravel 13 Core',
        'system_time' => now()->toIso8601String(),
        'auth_driver' => 'Sanctum Secure Token',
        'message' => 'Selamat datang di DompetKas API Node. Silakan gunakan port frontend untuk mengakses dashboard interface.'
    ], 200);
});