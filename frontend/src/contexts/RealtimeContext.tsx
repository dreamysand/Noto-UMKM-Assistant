import { createContext, useContext, useEffect, useState } from "react";
import { echo, initEcho } from "../services/echoService";
import { useAuth } from "../contexts/AuthContext";
import { syncService } from "../services/syncService";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    /**
     * Jika user belum login
     * jangan lakukan apapun
     */
    if (!user) return;

    /**
     * Ambil token dari localStorage
     * (token dibuat saat login berhasil)
     */
    const token = localStorage.getItem("token");
    if (!token) return;

    /**
     * Inisialisasi Echo
     */
    initEcho(token);

    // ==========================
    // PRODUCT CHANNEL
    // ==========================
    echo!
      .private(`product.${user.id}`)
      .listen(".SyncUpdated", async (e) => {
        // Update IndexedDB produk
        await syncService.applyProductsServerChanges(e.products);
        
        // Ambil history
        let history = JSON.parse(localStorage.getItem("history") || "{}");

        // Update history user ini
        history[user.id] = {
          lastSyncTimeProducts: Date.now().toString(),
        };

        // Simpan kembali
        localStorage.setItem("history", JSON.stringify(history));

      });

    // ==========================
    // TRANSACTION CHANNEL
    // ==========================
    echo!
      .private(`transaction.${user.id}`)
      .listen(".SyncUpdated", async (e) => {
        await syncService.applyTransactionsServerChanges(e.transactions);

        // Ambil history
        let history = JSON.parse(localStorage.getItem("history") || "{}");

        // Update history user ini
        history[user.id] = {
          lastSyncTimeTransactions: Date.now().toString(),
        };

        // Simpan kembali
        localStorage.setItem("history", JSON.stringify(history));

      });

    // Menandai realtime aktif
    setConnected(true);

    /**
     * Cleanup
     * Kalau user logout / berubah
     * tinggalkan channel agar tidak bocor
     */
    return () => {
      echo?.leave(`product.${user.id}`);
      echo?.leave(`transaction.${user.id}`);
      setConnected(false);
    };

  }, [user?.id]); // jalan ulang kalau user berubah

  return (
    <RealtimeContext.Provider value={{ connected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
