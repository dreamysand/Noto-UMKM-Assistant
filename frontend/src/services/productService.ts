import { db } from "./db";
import { Product } from "../types";

export const productService = {

  /**
   * Mengambil semua data produk dari IndexedDB
   * @returns Promise<Product[]>
   */
  async getAll(userId: number) {
    if (!userId) return 0;

    return db.products.where("userId").equals(userId).toArray();
  },

  /**
   * Mengambil semua produk yang belum tersinkronisasi dengan server
   * Biasanya dipakai saat proses sync ke backend
   * @returns Promise<Product[]>
   */
  async getUnsynced(userId: number) {
    if (!userId) return 0;

    return db.products.where("userId").equals(userId).and(item => item.synced === 0).toArray();
  },

  /**
   * Mengambil total produk yang belum tersinkronisasi dengan server
   *
   * Fungsi ini menghitung berapa banyak data produk di IndexedDB
   * yang memiliki status `synced = 0`, artinya data tersebut
   * masih lokal dan belum terkirim ke server.
   *
   * @returns Promise<number> - jumlah produk yang belum tersinkron
   */
  async getUnsyncedCount(userId: number) {
    if (!userId) return 0;
    
    return db.products.where("userId").equals(userId).and(item => item.synced === 0).count();
  },

  /**
   * Membuat / menyimpan produk baru ke dalam IndexedDB
   * Field yang tidak boleh dikirim oleh frontend:
   *  - id (auto increment oleh Dexie)
   *  - synced (otomatis 0 karena belum tersinkron)
   *  - clientUpdatedAt (waktu terakhir perubahan, otomatis)
   *  - serverId (nanti diisi setelah sinkron ke server)
   *  - deleted (soft delete flag)
   * 
   * @param product Data produk tanpa field internal Dexie
   * @returns Promise<number> id auto increment dari Dexie
   */
  async create(
    product: Omit<
      Product,
      "id" | "synced" | "clientUpdatedAt" | "serverId" | "deleted"
    >
  ) {
    return db.products.add({
      ...product,
      serverId: null,       // Belum ada ID dari server
      deleted: 0,           // 0 = masih aktif
      synced: 0,            // 0 = belum tersinkron
      clientUpdatedAt: Date.now()
    });
  },

  /**
   * Mengupdate data produk berdasarkan ID local IndexedDB
   * Setiap update akan:
   *  - menandai synced = 0 (butuh dikirim ke server lagi)
   *  - update clientUpdatedAt supaya kita tahu kapan terakhir berubah
   *
   * @param id number - ID produk di IndexedDB
   * @param data Partial<Product> - data yang ingin diupdate
   */
  async update(id: number, data: Partial<Product>) {
    return db.products.update(id, {
      ...data,
      synced: 0,
      clientUpdatedAt: Date.now(),
    });
  },

  /**
   * Soft delete product (tidak langsung dihapus dari IndexedDB)
   * Kenapa soft delete?
   *  - supaya nanti bisa disinkronkan ke server (hapus di server juga)
   *  - menghindari kehilangan data sebelum proses sync
   *
   * Jadi:
   *  deleted = true → menandai item sebagai terhapus
   *  synced = 0 → backend nanti akan memproses penghapusan
   *
   * @param id number
   */
  async remove(id: number) {
    return db.products.update(id, {
      deleted: 1,
      synced: 0,
      clientUpdatedAt: Date.now(),
    });
  },
};
