import Dexie, { type Table } from 'dexie';
import { Transaction, Product, Service, ChatMessage } from '../types';

class UFA_Database extends Dexie {
  // Definisi tabel Dexie
  transactions!: Table<Transaction, number>;
  products!: Table<Product, number>;
  services!: Table<Service, number>;
  chatHistory!: Table<ChatMessage, number>;

  constructor() {
    super('UMKM_Finance_Assistant_DB'); 
    // Nama database IndexedDB

    // Versi database → ganti angka kalau ubah struktur tabel
    (this as any).version(4).stores({

      /**
       * === TRANSACTIONS TABLE ===
       * ++id              → auto increment primary key
       * serverId          → id dari server (untuk sync)
       * userId            → id user
       * type              → income / expense
       * date              → tanggal transaksi
       * category          → kategori transaksi
       * amount            → jumlah uang
       * description       → catatan tambahan
       * deleted           → soft delete (untuk sync aman)
       * clientUpdatedAt   → kapan terakhir berubah (penting untuk conflict)
       * synced            → status sudah sync ke server atau belum
       */
      transactions:
        '++id, serverId, userId, type, date, category, amount, description, deleted, clientUpdatedAt, synced',

      /**
       * === PRODUCTS TABLE ===
       * Struktur mirip transaksi tapi untuk produk
       */
      products:
        '++id, serverId, userId, name, stock, price, unit, deleted, clientUpdatedAt, synced',

      /**
       * === SERVICES TABLE ===
       * Struktur mirip produk tapi untuk jasa
       */
      services:
        '++id, serverId, userId, name, price, unit, deleted, clientUpdatedAt, synced',

      /**
       * === CHAT HISTORY TABLE ===
       * ++id          → auto increment key
       * sender        → user / assistant
       * message       → pesan
       * createdAt     → timestamp
       *
       * NOTE:
       * Walaupun "message" tidak ditaruh di index,
       * tetap bisa disimpan karena Dexie hanya butuh key index,
       * field lain tetap bebas
       */
      chatHistory:
        '++id, userId, sender, message, createdAt'
    });
  }
}

// export db instance
export const db = new UFA_Database();
