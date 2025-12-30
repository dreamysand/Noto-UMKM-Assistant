<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini\Data\Content;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaction;
use App\Models\Product;

class AiController extends Controller
{
    /**
     * Mengirim pesan chat ke AI (Gemini) dan mendapatkan balasan
     * 
     * Alur singkat:
     * 1. Validasi request message
     * 2. Ambil user yang sedang login
     * 3. Ambil data transaksi & produk user sebagai konteks AI
     * 4. Hitung income, expense, profit, dan stok menipis
     * 5. Bentuk konteks + sistem instruksi AI
     * 6. Kirim ke Gemini dan ambil jawaban
     * 7. Kirim kembali response ke client
     */
    public function sendChatMessage (Request $request)
    {
        try {
            // Validasi input message wajib ada dan bertipe string
            $request->validate([
                'message' => 'required|string',
            ]);

            // Log pesan dari client (debugging)

            $user_message = $request->message;

            // Ambil ID user yang sedang login
            $user_id = Auth::id();

            /**
             * Ambil semua transaksi & produk milik user
             * Ini akan dipakai sebagai "context awareness"
             * agar AI benar-benar menjawab berdasarkan data bisnis user
             */
            $transactions = Transaction::where('user_id', $user_id)->get();
            $products = Product::where('user_id', $user_id)->get();

            // Hitung total pemasukan & pengeluaran
            $income = $transactions->where('type', 'income')->sum('amount');
            $expense = $transactions->where('type', 'expense')->sum('amount');

            // Hitung keuntungan bersih
            $profit = $income - $expense;

            /**
             * Cari produk yang stoknya menipis (< 10)
             * lalu ubah jadi string "Nama Produk (stok unit)"
             */
            $low_stock_items = $products->filter(fn($p) => $p->stock < 10)
                                      ->map(fn($p) => "{$p->name} ({$p->stock} {$p->unit})")
                                      ->implode(', ');

            /**
             * Context yang dikirim ke AI
             * berisi ringkasan kondisi bisnis user
             */
            $context = "
            [DATA KONTEKS TOKO]
            - Total Pemasukan: Rp " . number_format($income, 0, ',', '.') . "
            - Total Pengeluaran: Rp " . number_format($expense, 0, ',', '.') . "
            - Keuntungan Bersih: Rp " . number_format($profit, 0, ',', '.') . "
            - Stok Menipis: " . ($low_stock_items ?: 'Tidak ada') . "
            - Jumlah Transaksi Tercatat: " . $transactions->count() . "

            [PERTANYAAN USER]
            {$user_message}
            ";

            /**
             * System Instruction (role AI)
             * → Mengatur karakter, bahasa, gaya jawab, & batasan AI
             */
            $system_instruction = "
            You are 'Smart Financial Advisor', an AI assistant for a small MSME (UMKM) owner in Indonesia. 
            Your goal is to answer the user's questions specifically about their business.
            Always use Bahasa Indonesia.
            Keep responses concise, professional yet friendly.
            If the user asks about pricing, refer to standard margins (10-50%).
            ";

            /**
             * Kirim data ke Gemini + system role + context
             * dan ambil response text yang sudah diproses AI
             */
            $result = Gemini::generativeModel(model: 'gemini-2.5-flash')
                ->withSystemInstruction(
                    Content::parse($system_instruction)
                )
                ->generateContent($context);
            
            $message = $result->text();

            // Response sukses ke frontend
            return response()->json([
                'success' => true,
                'reply' => $message
            ], 200);

        } catch (\Exception $e) {
            // Kirim response error ke frontend
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
