import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Laravel Echo butuh Pusher walaupun pakai Reverb
// Jadi kita pasang ke window
window.Pusher = Pusher;

// Kita TIDAK langsung buat Echo di sini
// Karena saat file ini di-load, token biasanya belum ada
// Jadi cuma sediakan variable kosong dulu
export let echo: Echo | null = null;

/**
 * initEcho()
 * Fungsi ini baru dipanggil setelah user login
 * dan token sudah ada di localStorage
 */
export function initEcho(token: string) {
  echo = new Echo({
    broadcaster: "reverb",

    // KEY & HOST sama seperti backend
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || "localhost",

    // Port WebSocket
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,

    // Karena lokal biasanya pakai http
    forceTLS: false,

    // Gunakan websocket murni
    enabledTransports: ["ws", "wss"],

    // Endpoint auth private channel laravel
    authEndpoint: "http://localhost:8000/broadcasting/auth",

    // Kirim Bearer Token ke Laravel
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
