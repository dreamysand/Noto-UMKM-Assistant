import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Komponen pembungkus untuk proteksi route
// children = halaman yang ingin dilindungi (hanya bisa diakses jika login)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Ambil status autentikasi dari AuthContext
  const { isAuthenticated } = useAuth();

  // Jika belum login / user null / tidak ada token
  if (!isAuthenticated) {
    // Redirect ke halaman login
    // replace = agar tidak bisa kembali ke halaman sebelumnya dengan tombol back
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, tampilkan halaman aslinya
  return children;
};

export default ProtectedRoute;
