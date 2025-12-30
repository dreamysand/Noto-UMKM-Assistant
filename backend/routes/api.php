<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\AiController;

/**
 * ==========================================
 * AUTH & ACCOUNT MANAGEMENT (ADMIN)
 * ==========================================
 * Endpoint terkait autentikasi admin:
 * - Login
 * - Register
 * - Reset Password (Request OTP, Validasi OTP, Proses Reset)
 * - Resend OTP
 */
Route::prefix('users')->group(function ()
{
    // Login admin
	Route::post('/login', [UserController::class, 'login']);

    // Request reset password (mengirim OTP ke email)
	Route::post('/reset-password-request', [UserController::class, 'resetPasswordRequest']);

    // Validasi OTP reset password
	Route::post('/reset-password-validate', [UserController::class, 'resetPasswordValidate']);

    // Kirim ulang OTP kalau OTP sebelumnya expire / hilang
	Route::post('/resend-otp', [UserController::class, 'resendOtp']);

    // Proses final reset password setelah OTP valid
	Route::post('/reset-password-process', [UserController::class, 'resetPasswordProcess']);

    // Register admin baru
	Route::post('/register', [UserController::class, 'register']);
});


/**
 * ==========================================
 * ADMIN AUTH PROTECTED ROUTES
 * ==========================================
 * Semua endpoint di bawah ini hanya bisa diakses
 * jika user sudah login menggunakan Sanctum Token
 */
Route::middleware(['auth:sanctum'])->prefix('users')->group(function ()
{
    // Mendapatkan data admin yang sedang login (profile)
	Route::get('/me', [UserController::class, 'me']);

    // Logout dan revoke token
	Route::post('/logout', [UserController::class, 'logout']);
});

// CRUD Resource untuk Admin (diproteksi Sanctum)
Route::apiResource('users', UserController::class)->middleware(['auth:sanctum']);

// GET Image terproteksi
Route::middleware(['auth:sanctum'])->get('/users/image/{path}', function ($path) {
    if (!Storage::disk('private')->exists($path)) {
        abort(404, 'Image not found');
    }

    $file = Storage::disk('private')->get($path);
    $type = Storage::disk('private')->mimeType($path);

    return response($file)->header('Content-Type', $type);
})->where('path', '.*')->name('api.user.image');

/**
 * ==========================================
 * PRODUCT SYNC API
 * ==========================================
 * Digunakan untuk sinkronisasi IndexedDB ↔ Server
 */
Route::middleware(['auth:sanctum'])->prefix('products')->group(function ()
{
    // Push + Resolve Conflict + Sinkronisasi produk ke server
	Route::post('/sync', [SyncController::class, 'syncProducts']);

    // Pull data produk terbaru dari server
	Route::get('/pull-products', [SyncController::class, 'pullProducts']);
});

/**
 * ==========================================
 * SERVICE SYNC API
 * ==========================================
 * Digunakan untuk sinkronisasi IndexedDB ↔ Server
 */
Route::middleware(['auth:sanctum'])->prefix('services')->group(function ()
{
    // Push + Resolve Conflict + Sinkronisasi produk ke server
	Route::post('/sync', [SyncController::class, 'syncServices']);

    // Pull data produk terbaru dari server
	Route::get('/pull-services', [SyncController::class, 'pullServices']);
});


/**
 * ==========================================
 * TRANSACTION SYNC API
 * ==========================================
 * Sinkronisasi transaksi offline / online
 */
Route::middleware(['auth:sanctum'])->prefix('transactions')->group(function ()
{
    // Sinkronisasi transaksi (push + merge + conflict resolve)
	Route::post('/sync', [SyncController::class, 'syncTransactions']);

    // Ambil (pull) transaksi terbaru dari server
	Route::get('/pull-transactions', [SyncController::class, 'pullTransactions']);
});


/**
 * ==========================================
 * AI CHAT API
 * ==========================================
 * Digunakan untuk fitur Chat AI (Gemini)
 * Memberikan jawaban berdasarkan data transaksi & produk user
 */
Route::middleware(['auth:sanctum'])->prefix('ai')->group(function ()
{
	Route::post('/chat', [AiController::class, 'sendChatMessage']);
});
