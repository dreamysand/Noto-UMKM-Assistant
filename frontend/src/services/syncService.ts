import { db } from "./db";
import { transactionService } from "./transactionService";
import { productService } from "./productService";
import { serviceService } from "./serviceService";

const API_URL = "http://localhost:8000/api";

export const syncService = {
  // =========================================
  // PRODUCTS SYNC (Client → Server)
  // =========================================
  /**
   * Mengirim semua product yang belum tersinkron (synced = 0)
   * ke server dalam bentuk batch
   *
   * Alur:
   * 1️⃣ Ambil data yang belum sync dari IndexedDB
   * 2️⃣ Kirim ke endpoint /products/sync
   * 3️⃣ Server proses → balikan data hasil final
   * 4️⃣ Simpan hasil final ke IndexedDB
   * 5️⃣ Update lastSyncTime untuk kebutuhan "pull"
   */
  async syncProducts(token: string, userId: number) {
    const unsynced = await productService.getUnsynced(userId);

    // Kalau tidak ada yang perlu disync → stop
    if (!unsynced.length) return;

    try {
      const res = await fetch(`${API_URL}/products/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: unsynced
        }),
      });

      if (!res.ok) {
        console.error("Batch sync failed:", await res.text());
        return;
      }

      const response = await res.json();

      // Simpan waktu sync terakhir
            // Terapkan perubahan dari server ke local DB
      await this.applyProductsServerChanges(response.data);

    } catch (err) {
      console.error("Product batch sync failed:", err);
    }
  },

  // =========================================
  // PRODUCTS PULL (Server → Client)
  // =========================================
  /**
   * Mengambil update data dari server sejak lastSyncTimeProducts
   * → Jadi cuma tarik data yang berubah saja
   *
   * Dipakai saat:
   *  - user login
   *  - refresh halaman
   *  - sync manual
   */
  async pullProducts(token: string, userId: number) {
    const history = JSON.parse(localStorage.getItem("history") || "{}");

    const lastSync = history[userId]?.lastSyncTimeProducts || null;

    try {
      const res = await fetch(
        `${API_URL}/products/pull-products?lastSyncAt=${lastSync}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (!res.ok) {
        console.error('Pull failed');
        return;
      }

      const response = await res.json();

      await this.applyProductsServerChanges(response.data);

    } catch (err) {
      console.error("Product sync failed:", err);
    }
  },

  // =========================================
  // SERVICES SYNC (Client → Server)
  // Polanya sama kayak products
  // =========================================
  async syncServices(token: string, userId: number) {
    const unsynced = await serviceService.getUnsynced(userId);

    // Kalau tidak ada yang perlu disync → stop
    if (!unsynced.length) return;

    try {
      const res = await fetch(`${API_URL}/services/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          services: unsynced
        }),
      });

      if (!res.ok) {
        console.error("Batch sync failed:", await res.text());
        return;
      }

      const response = await res.json();

      // Simpan waktu sync terakhir
            // Terapkan perubahan dari server ke local DB
      await this.applyServicesServerChanges(response.data);

    } catch (err) {
      console.error("Product batch sync failed:", err);
    }
  },

  // =========================================
  // SERVICES PULL (Server → Client)
  // Polanya sama kayak products
  // =========================================
  async pullServices(token: string, userId: number) {
    const history = JSON.parse(localStorage.getItem("history") || "{}");

    const lastSync = history[userId]?.lastSyncTimeProducts || null;

    try {
      const res = await fetch(
        `${API_URL}/services/pull-services?lastSyncAt=${lastSync}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (!res.ok) {
        console.error('Pull failed');
        return;
      }

      const response = await res.json();

      await this.applyServicesServerChanges(response.data);

    } catch (err) {
      console.error("Product sync failed:", err);
    }
  },


  // =========================================
  // TRANSACTIONS SYNC & PULL
  // Polanya sama kayak products
  // =========================================
  async syncTransactions(token: string, userId: number) {
    const unsynced = await transactionService.getUnsynced(userId);

    if (!unsynced.length) return;

    try {
      const res = await fetch(`${API_URL}/transactions/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactions: unsynced
        }),
      });

      if (!res.ok) {
        console.error("Batch sync failed:", await res.text());
        return;
      }

      const response = await res.json();

      await this.applyTransactionsServerChanges(response.data);

    } catch (err) {
      console.error("Product batch sync failed:", err);
    }
  },

  async pullTransactions(token: string, userId: number) {
    const history = JSON.parse(localStorage.getItem("history") || "{}");

    const lastSync = history[userId]?.lastSyncTimeTransactions || null;

    try {
      const res = await fetch(
        `${API_URL}/transactions/pull-transactions?lastSyncAt=${lastSync}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (!res.ok) {
        console.error('Pull failed');
        return;
      }

      const response = await res.json();

      await this.applyTransactionsServerChanges(response.data);

    } catch (err) {
      console.error("Product sync failed:", err);
    }
  },

  // =========================================
  // SYNC HELPER (sync semua sekaligus)
  // =========================================
  /**
   * Sync semua data local → server
   */
  async syncAll(token: string, userId: number) {
    await Promise.all([
      this.syncProducts(token, userId),
      this.syncServices(token, userId),
      this.syncTransactions(token, userId)
    ]);

    // Ambil history
    let history = JSON.parse(localStorage.getItem("history") || "{}");

    // Update history user ini
    history[userId] = {
      lastSyncTimeProducts: Date.now().toString(),
      lastSyncTimeTransactions: Date.now().toString(),
    };

    // Simpan kembali
    localStorage.setItem("history", JSON.stringify(history));
  },

  /**
   * Pull semua data server → local
   */
  async pullAll(token: string, userId: number) {
    await Promise.all([
      this.pullProducts(token, userId),
      this.pullServices(token, userId),
      this.pullTransactions(token, userId)
    ]);

    // Ambil history
    let history = JSON.parse(localStorage.getItem("history") || "{}");

    // Update history user ini
    history[userId] = {
      lastSyncTimeProducts: Date.now().toString(),
      lastSyncTimeTransactions: Date.now().toString(),
    };

    // Simpan kembali
    localStorage.setItem("history", JSON.stringify(history));
  },

  // =========================================
  // APPLY SERVER → LOCAL CHANGES
  // =========================================
  /**
   * Menggabungkan data server dan local
   * Handling:
   *  - Data baru dari server → tambahkan
   *  - Data delete di server → hapus local
   *  - Kalau ada konflik → pakai yang clientUpdatedAt terbaru
   */
  async applyProductsServerChanges(productsFromServer) {
    for (const server of productsFromServer) {
      const dateObj = new Date(server.client_updated_at);

      // Cari berdasarkan serverId
      let existing = await db.products
        .where("serverId")
        .equals(server.id)
        .first();

      // Kalau belum punya serverId, cocokkan pakai client_id
      if (!existing &&
          server.client_id !== null &&
          server.client_id !== undefined
        ) {
        existing = await db.products
          .where("id")
          .equals(server.client_id)
          .first();
      }

      // Jika server menandai deleted → hapus di indexedDB
      if (server.is_deleted) {
        if (existing) await db.products.delete(existing.id);
        continue;
      }

      // Jika tidak ada di local → tambahkan
      if (!existing) {
        await db.products.add({
          userId: server.user_id,
          serverId: server.id,
          name: server.name,
          stock: server.stock,
          price: server.price,
          unit: server.unit,
          clientUpdatedAt: dateObj.getTime(),
          deleted: 0,
          synced: 1
        });
        continue;
      }

      // Jika versi server lebih baru → update local
      if (dateObj.getTime() >= existing.clientUpdatedAt) {
        await db.products.update(existing.id, {
          serverId: server.id,
          name: server.name,
          stock: server.stock,
          price: server.price,
          unit: server.unit,
          clientUpdatedAt: dateObj.getTime(),
          synced: 1
        });
      }
    }
  },

  async applyServicesServerChanges(servicesFromServer) {
    for (const server of servicesFromServer) {
      const dateObj = new Date(server.client_updated_at);

      // Cari berdasarkan serverId
      let existing = await db.services
        .where("serverId")
        .equals(server.id)
        .first();

      // Kalau belum punya serverId, cocokkan pakai client_id
      if (!existing &&
          server.client_id !== null &&
          server.client_id !== undefined
        ) {
        existing = await db.services
          .where("id")
          .equals(server.client_id)
          .first();
      }

      // Jika server menandai deleted → hapus di indexedDB
      if (server.is_deleted) {
        if (existing) await db.services.delete(existing.id);
        continue;
      }

      // Jika tidak ada di local → tambahkan
      if (!existing) {
        await db.services.add({
          userId: server.user_id,
          serverId: server.id,
          name: server.name,
          price: server.price,
          unit: server.unit,
          clientUpdatedAt: dateObj.getTime(),
          deleted: 0,
          synced: 1
        });
        continue;
      }

      // Jika versi server lebih baru → update local
      if (dateObj.getTime() >= existing.clientUpdatedAt) {
        await db.services.update(existing.id, {
          serverId: server.id,
          name: server.name,
          price: server.price,
          unit: server.unit,
          clientUpdatedAt: dateObj.getTime(),
          synced: 1
        });
      }
    }
  },

  async applyTransactionsServerChanges(transactionsFromServer) {
    for (const server of transactionsFromServer) {
      const dateObj = new Date(server.client_updated_at);

      let existing = await db.transactions
        .where("serverId")
        .equals(server.id)
        .first();

      if (!existing &&
          server.client_id !== null &&
          server.client_id !== undefined
        ) {
        existing = await db.transactions
          .where("id")
          .equals(server.client_id)
          .first();
      }

      if (server.is_deleted) {
        if (existing) await db.transactions.delete(existing.id);
        continue;
      }

      if (!existing) {
        await db.transactions.add({
          userId: server.user_id,
          serverId: server.id,
          type: server.type,
          category: server.category,
          amount: server.amount,
          date: dateObj.toISOString(),
          description: server.description,
          clientUpdatedAt: dateObj.getTime(),
          deleted: 0,
          synced: 1
        });
        continue;
      }

      if (dateObj.getTime() >= existing.clientUpdatedAt) {
        await db.transactions.update(existing.id, {
          serverId: server.id,
          type: server.type,
          category: server.category,
          amount: server.amount,
          description: server.description,
          clientUpdatedAt: dateObj.getTime(),
          synced: 1
        });
      }
    }
  },
};
