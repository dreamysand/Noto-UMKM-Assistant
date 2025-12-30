import { chatService } from "./chatService";

// Endpoint API tujuan AI
const API_URL = "http://localhost:8000/api/ai/chat";

export const aiService = {
  async sendMessage(message: string, token: string, userId: number) {
    
    // === Simpan pesan user ke database lokal (Dexie / IndexedDB) ===
    const userMsg = await chatService.addMessage({
      userId: userId,
      sender: "user",
      message,
      createdAt: new Date().toISOString(),
    });

    try {
      // === Kirim pesan ke server AI ===
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Token untuk autentikasi API (Bearer Token)
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }), // kirim body JSON ke backend
      });

      // Jika response gagal (status bukan 200-299), lempar error
      if (!res.ok) throw new Error("Request AI gagal");

      // === Ambil hasil response dari server ===
      const data = await res.json();

      // === Simpan balasan AI ke database lokal ===
      await chatService.addMessage({
        userId: userId,
        sender: "assistant",
        message: data.reply,
        createdAt: new Date().toISOString(),
      });

      // === Kembalikan pesan balasan ke UI ===
      return data.reply;

    } catch (err) {
      // Jika ada error (koneksi / server down / token salah dll)
      console.error(err);
      return false; // supaya UI bisa handle kondisi gagal
    }
  },
};
