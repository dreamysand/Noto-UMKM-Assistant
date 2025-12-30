<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\Service;
use App\Events\TransactionSynced;
use App\Events\ProductSynced;
use App\Events\ServiceSynced;
use Carbon\Carbon;

class SyncController extends Controller
{
    /**
     * ================================
     * SYNC TRANSACTIONS (Push from Client → Server)
     * ================================
     * - Client mengirim daftar transaksi lokal yang belum sinkron
     * - Server akan:
     *    1. Membuat data baru jika belum ada di server
     *    2. Mengabaikan update jika server lebih baru (server wins)
     *    3. Meng-handle soft delete
     *    4. Mengupdate jika client lebih baru
     * - Mengembalikan list hasil final agar client update local DB
     */
    public function syncTransactions(Request $request)
    {
        try {
            // Validasi request wajib berisi array transaksi
            $request->validate([
                'transactions' => 'required|array'
            ]);

            $results = [];
            $user_id = auth()->id();

            foreach ($request->transactions as $client) {

                /**
                 * Cari data milik user ini berdasarkan serverId
                 */
                $server = Transaction::where('user_id', $user_id)
                    ->find($client['serverId']);

                /**
                 * ===============================
                 * CASE 1 — DATA TIDAK ADA DI SERVER
                 * Artinya ini transaksi baru dari client
                 * ===============================
                 */
                if (!$server) {
                    $new = Transaction::create([
                        'user_id' => $user_id,
                        'type' => $client['type'],
                        'category' => $client['category'],
                        'amount' => $client['amount'],
                        'description' => $client['description'] ?? null,
                        'is_deleted' => $client['deleted'] ?? false,

                        // Convert timestamp ms dari client → datetime
                        'client_updated_at' => Carbon::createFromTimestampMs(
                            $client['clientUpdatedAt']
                        )
                    ]);

                    // simpan ID client supaya Dexie bisa mencocokkan
                    $new->client_id = $client['id'];
                    $results[] = $new;
                    
                    continue;
                }

                /**
                 * ===============================
                 * CASE 2 — DATA DI SERVER LEBIH BARU
                 * Client tidak boleh overwrite
                 * ===============================
                 */
                if ($client['clientUpdatedAt'] <= Carbon::parse($server->client_updated_at)->valueOf()) {
                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * ===============================
                 * CASE 3 — CLIENT MENGHAPUS DATA
                 * Soft delete → tandai is_deleted
                 * ===============================
                 */
                if (!empty($client['deleted']) && $client['deleted']) {
                    $server->is_deleted = true;
                    $server->client_updated_at = Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    );
                    $server->save();

                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * ===============================
                 * CASE 4 — CLIENT UPDATE DATA
                 * Server mengikuti client (client wins di kondisi ini)
                 * ===============================
                 */
                $server->update([
                    'type' => $client['type'],
                    'category' => $client['category'],
                    'amount' => $client['amount'],
                    'description' => $client['description'] ?? null,
                    'is_deleted' => false,
                    'client_updated_at' => Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    )
                ]);

                $server->client_id = $client['id'];
                $results[] = $server;
            }

            /**
             * Broadcast realtime ke client lain
             * agar UI langsung update tanpa reload
             */
            event(new TransactionSynced($results, $user_id));

            return response()->json([
                'success' => true,
                'message' => 'Data successfully sync.',
                'data' => $results,

                // Penting untuk next sync reference time
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            // Jika gagal, balikan error yang jelas
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ================================
     * SYNC PRODUCTS (Push Client → Server)
     * Mekanisme sama seperti transaksi
     * ================================
     */
    public function syncProducts(Request $request)
    {
        try {
            $request->validate([
                'products' => 'required|array'
            ]);

            $results = [];
            $user_id = auth()->id();

            foreach ($request->products as $client) {

                $server = Product::where('user_id', $user_id)
                    ->find($client['serverId']);

                /**
                 * CASE 1 — BELUM ADA DI SERVER → BUAT BARU
                 */
                if (!$server) {
                    $new = Product::create([
                        'user_id' => $user_id,
                        'name' => $client['name'],
                        'stock' => $client['stock'],
                        'price' => $client['price'],
                        'unit' => $client['unit'],
                        'is_deleted' => $client['deleted'] ?? false,
                        'client_updated_at' => Carbon::createFromTimestampMs(
                            $client['clientUpdatedAt']
                        )
                    ]);

                    $new->client_id = $client['id'];
                    $results[] = $new;
                    continue;
                }

                /**
                 * CASE 2 — SERVER LEBIH BARU → ABAIKAN UPDATE CLIENT
                 */
                if ($client['clientUpdatedAt'] <= Carbon::parse($server->client_updated_at)->valueOf()) {
                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * CASE 3 — CLIENT DELETE
                 */
                if (!empty($client['deleted']) && $client['deleted']) {
                    $server->is_deleted = true;
                    $server->client_updated_at = Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    );
                    $server->save();

                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * CASE 4 — UPDATE PRODUCT DATA
                 */
                $server->update([
                    'name' => $client['name'],
                    'stock' => $client['stock'],
                    'price' => $client['price'],
                    'unit' => $client['unit'],
                    'is_deleted' => false,
                    'client_updated_at' => Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    )
                ]);

                $server->client_id = $client['id'];
                $results[] = $server;
            }

            // Broadcast realtime hasil sync
            event(new ProductSynced($results, $user_id));

            return response()->json([
                'success' => true,
                'message' => 'Data successfully sync.',
                'data' => $results,
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ================================
     * SYNC SERVICES (Push Client → Server)
     * Mekanisme sama seperti transaksi
     * ================================
     */
    public function syncServices(Request $request)
    {
        try {
            $request->validate([
                'services' => 'required|array'
            ]);

            $results = [];
            $user_id = auth()->id();

            foreach ($request->services as $client) {

                $server = Service::where('user_id', $user_id)
                    ->find($client['serverId']);

                /**
                 * CASE 1 — BELUM ADA DI SERVER → BUAT BARU
                 */
                if (!$server) {
                    $new = Service::create([
                        'user_id' => $user_id,
                        'name' => $client['name'],
                        'price' => $client['price'],
                        'unit' => $client['unit'],
                        'is_deleted' => $client['deleted'] ?? false,
                        'client_updated_at' => Carbon::createFromTimestampMs(
                            $client['clientUpdatedAt']
                        )
                    ]);

                    $new->client_id = $client['id'];
                    $results[] = $new;
                    continue;
                }

                /**
                 * CASE 2 — SERVER LEBIH BARU → ABAIKAN UPDATE CLIENT
                 */
                if ($client['clientUpdatedAt'] <= Carbon::parse($server->client_updated_at)->valueOf()) {
                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * CASE 3 — CLIENT DELETE
                 */
                if (!empty($client['deleted']) && $client['deleted']) {
                    $server->is_deleted = true;
                    $server->client_updated_at = Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    );
                    $server->save();

                    $server->client_id = $client['id'];
                    $results[] = $server;
                    continue;
                }

                /**
                 * CASE 4 — UPDATE PRODUCT DATA
                 */
                $server->update([
                    'name' => $client['name'],
                    'stock' => $client['stock'],
                    'price' => $client['price'],
                    'unit' => $client['unit'],
                    'is_deleted' => false,
                    'client_updated_at' => Carbon::createFromTimestampMs(
                        $client['clientUpdatedAt']
                    )
                ]);

                $server->client_id = $client['id'];
                $results[] = $server;
            }

            // Broadcast realtime hasil sync
            event(new ServiceSynced($results, $user_id));

            return response()->json([
                'success' => true,
                'message' => 'Data successfully sync.',
                'data' => $results,
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ================================
     * PULL TRANSACTIONS (Server → Client)
     * ================================
     * - Client meminta update terbaru dari server
     * - Jika mengirim lastSyncAt → hanya ambil yang lebih baru
     * - Digunakan untuk:
     *    • online sync
     *    • recovery
     *    • ketika user login di device baru
     */
    public function pullTransactions(Request $request)
    {
        try {
            $lastSync = $request->lastSyncAt ?? null;

            $query = Transaction::where('user_id', auth()->id());

            // Jika client kirim lastSync → ambil hanya yang lebih baru
            if ($lastSync) {
                $query->where('client_updated_at', '>', $lastSync);
            }

            return response()->json([
                'success' => true,
                'data' => $query->get(),
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ================================
     * PULL PRODUCTS (Server → Client)
     * ================================
     */
    public function pullProducts(Request $request)
    {
        try {
            $lastSync = $request->lastSyncAt ?? null;

            $query = Product::where('user_id', auth()->id());

            if ($lastSync) {
                $query->where('client_updated_at', '>', $lastSync);
            }

            return response()->json([
                'success' => true,
                'data' => $query->get(),
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ================================
     * PULL SERVICES (Server → Client)
     * ================================
     */
    public function pullServices(Request $request)
    {
        try {
            $lastSync = $request->lastSyncAt ?? null;

            $query = Service::where('user_id', auth()->id());

            if ($lastSync) {
                $query->where('client_updated_at', '>', $lastSync);
            }

            return response()->json([
                'success' => true,
                'data' => $query->get(),
                'serverTime' => now()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
