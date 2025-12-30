import { db } from "./db";
import { Service } from "../types";

export const serviceService = {

  /**
   * Mengambil semua data jasa dari IndexedDB
   * @returns Promise<Service[]>
   */
  async getAll(userId: number) {
    if (!userId) return 0;

    return db.services.where("userId").equals(userId).toArray();
  },

  /**
   * Mengambil semua jasa yang belum tersinkronisasi dengan server
   * Biasanya dipakai saat proses sync ke backend
   * @returns Promise<Service[]>
   */
  async getUnsynced(userId: number) {
    if (!userId) return 0;

    return db.services.where("userId").equals(userId).and(item => item.synced === 0).toArray();
  },

  /**
   * Mengambil total jasa yang belum tersinkronisasi dengan server
   *
   * Fungsi ini menghitung berapa banyak data jasa di IndexedDB
   * yang memiliki status `synced = 0`, artinya data tersebut
   * masih lokal dan belum terkirim ke server.
   *
   * @returns Promise<number> - jumlah jasa yang belum tersinkron
   */
  async getUnsyncedCount(userId: number) {
    if (!userId) return 0;
    
    return db.services.where("userId").equals(userId).and(item => item.synced === 0).count();
  },

  /**
   * Membuat / menyimpan jasa baru ke dalam IndexedDB
   * Field yang tidak boleh dikirim oleh frontend:
   *  - id (auto increment oleh Dexie)
   *  - synced (otomatis 0 karena belum tersinkron)
   *  - clientUpdatedAt (waktu terakhir perubahan, otomatis)
   *  - serverId (nanti diisi setelah sinkron ke server)
   *  - deleted (soft delete flag)
   * 
   * @param service Data jasa tanpa field internal Dexie
   * @returns Promise<number> id auto increment dari Dexie
   */
  async create(
    service: Omit<
      service,
      "id" | "synced" | "clientUpdatedAt" | "serverId" | "deleted"
    >
  ) {
    return db.services.add({
      ...service,
      serverId: null,       // Belum ada ID dari server
      deleted: 0,           // 0 = masih aktif
      synced: 0,            // 0 = belum tersinkron
      clientUpdatedAt: Date.now()
    });
  },

  /**
   * Soft delete service (tidak langsung dihapus dari IndexedDB)
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
    return db.services.update(id, {
      deleted: 1,
      synced: 0,
      clientUpdatedAt: Date.now(),
    });
  },
};
