import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";

// Ambil element root dari HTML
// Aplikasi React akan "dipasang" ke dalam elemen ini
const rootElement = document.getElementById('root');

// Jika tidak ditemukan, hentikan aplikasi dan tampilkan error
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Buat root React 18
const root = ReactDOM.createRoot(rootElement);

// Render aplikasi utama
root.render(
  <React.StrictMode>
    
    {/* BrowserRouter
        Menyediakan fitur routing berbasis URL
        Agar aplikasi bisa menggunakan <Route>, <Link>, dll */}
    <BrowserRouter>

      {/* AuthProvider
          Menyediakan context authentication
          Menyimpan data user login, token, dll
          Sehingga bisa diakses di seluruh aplikasi */}
      <AuthProvider>

        {/* RealtimeProvider
            Menyediakan context realtime (misal WebSocket / Sync)
            Digunakan agar fitur realtime bisa diakses global */}
        <RealtimeProvider>

          {/* App
              Komponen utama aplikasi
              Berisi seluruh halaman & routing */}
          <App />

        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
