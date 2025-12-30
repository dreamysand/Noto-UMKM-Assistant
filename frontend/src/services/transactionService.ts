import { db } from "./db";
import type { Transaction } from "../types";

export const transactionService = {

  /**
   * Mengambil semua transaksi dari IndexedDB
   * @returns Promise<Transaction[]>
   */
  async getAll(userId: number) {
    if (!userId) return 0;

    return db.transactions.where("userId").equals(userId).toArray();
  },

  /**
   * Mengambil transaksi terbaru
   * Diurutkan berdasarkan field `date` lalu dibalik (terbaru di atas)
   * @returns Promise<Transaction[]>
   */
  async getLatest(userId: number) {
    if (!userId) return 0;

    const list = await db.transactions
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');

    return list.reverse();
  },

  /**
   * Mengambil transaksi yang belum tersinkron ke server
   * sync = 0 → berarti belum dikirim / belum divalidasi server
   * @returns Promise<Transaction[]>
   */
  async getUnsynced(userId: number) {
    if (!userId) return 0;

    return db.transactions.where("userId").equals(userId).and(item => item.synced === 0).toArray();
  },

  /**
   * Mengambil total transaksi yang belum tersinkronisasi dengan server
   *
   * Fungsi ini menghitung berapa banyak data transaksi di IndexedDB
   * yang memiliki status `synced = 0`, artinya data tersebut
   * masih lokal dan belum terkirim ke server.
   *
   * @returns Promise<number> - jumlah transaksi yang belum tersinkron
   */
  async getUnsyncedCount(userId: number) {
    if (!userId) return 0;
    
    return db.transactions.where("userId").equals(userId).and(item => item.synced === 0).count();
  },

  /**
   * Membuat transaksi baru dan menyimpannya ke IndexedDB
   * Catatan:
   * - serverId = null → karena belum ada id dari server
   * - synced = 0 → menandakan belum dikirim ke server
   * - deleted = 0 → belum dihapus
   * - clientUpdatedAt → dipakai untuk conflict resolution
   *
   * @param tx data transaksi tanpa id, serverId, synced, clientUpdatedAt
   * @returns Promise<number> id auto increment dari Dexie
   */
  async create(tx: Omit<Transaction, "id" | "serverId" | "synced" | "clientUpdatedAt">) {
    return db.transactions.add({
      ...tx,
      serverId: null,         
      deleted: 0,
      synced: 0,
      clientUpdatedAt: Date.now(),
    });
  },
};
