import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// Tipe data user
type User = {
  id: number;
  name: string;
  email: string;
};

// Tipe data untuk Context
type AuthContextType = {
  user: User | null;                      // User yang sedang login
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; message: string }>; // Fungsi login
  updateUser: (data: { email: string; password: string }, userId: number) => Promise<{ success: boolean; message: string }>; // Fungsi update user
  logout: () => Promise<void>;            // Fungsi logout
  isAuthenticated: boolean;               // Flag apakah user sudah login
};

// Membuat Context Auth
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // State user tersimpan di sini
  const [user, setUser] = useState<User | null>(null);

  // 🔄 Restore session saat halaman pertama kali dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Jika token ada, cek valid atau tidak lewat endpoint me()
      authService
        .me(token)
        .then((user) => {
          setUser(user);    // Simpan user ke state
          navigate("/");    // Redirect ke beranda
        })
        .catch(() => {
          // Jika token invalid, hapus dan paksa login lagi
          logout();
          navigate("/login")
        });
    } else {
      // Jika tidak ada token, redirect login
      navigate("/login");
    }
  }, []);

  // Fungsi login
  const login = async (data: {email: string; password: string}) => {
    // Request login ke API
    const { success, message, user, token } = await authService.login(data);

    // Jika login berhasil, simpan token & user
    if (user && token) {
      localStorage.setItem("token", token); // Simpan token
      setUser(user);                        // Simpan data user
    }

    return {
      success: success,
      message: message,
    };
  };

  // Fungsi update
  const updateUser = async (data: FormData, userId: number) => {
    const token = localStorage.getItem("token");
    
    // Request update ke API
    const { success, message, user } = await authService.updateUser(data, userId, token);

    // Jika update berhasil, simpan token & user
    if (user) {
      setUser(user);                        // Simpan data user
    }

    return {
      success: success,
      message: message,
    };
  };

  // Fungsi logout
  const logout = async () => {
    const token = localStorage.getItem("token");

    // Panggil logout API kalau ada token
    if (token) await authService.logout(token);

    // Hapus data login
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    // Sediakan data ke seluruh aplikasi
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user, // true jika user tidak null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan AuthContext
export const useAuth = () => {
  const ctx = useContext(AuthContext);

  // Pastikan dipanggil dalam `<AuthProvider>`
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  
  return ctx;
};
