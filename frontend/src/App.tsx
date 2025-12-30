import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Help from './pages/Help';
import Inventory from './pages/Inventory';
import SmartAdvisor from './pages/SmartAdvisor';
import SmartPricing from './pages/SmartPricing';
import { db } from './services/db';
import { syncService } from './services/syncService';
import { productService } from './services/productService';
import { serviceService } from './services/serviceService';
import { transactionService } from './services/transactionService';
import { useLiveQuery } from 'dexie-react-hooks';
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";


// ==========================
// Online Status Hook
// ==========================
// Gunanya untuk mendeteksi perubahan status internet secara realtime
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { user, isAuthenticated } = useAuth();

  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");

    if (saved) return saved === "dark";

    // kalau belum ada preferensi → ikut sistem
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialTheme);
  
  // apply ke HTML + simpan localStorage
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // listen kalau sistem berubah (dan user belum override)
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      // hanya update kalau user belum pernah memilih
      const saved = localStorage.getItem("theme");
      if (!saved) setDark(media.matches);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // ==========================
  // Hitung data yang belum tersync
  // ==========================
  const unsyncedTransactions = useLiveQuery(
    async () => user ? await transactionService.getUnsyncedCount(user.id) : 0,
    [user]
  ) || 0;

  const unsyncedProducts = useLiveQuery(
    async () => user ? await productService.getUnsyncedCount(user.id) : 0,
    [user]
  ) || 0;

  const unsyncedServices = useLiveQuery(
    async () => user ? await serviceService.getUnsyncedCount(user.id) : 0,
    [user]
  ) || 0;

  const totalPending = isAuthenticated && user
    ? unsyncedTransactions + unsyncedProducts + unsyncedServices
    : 0;
    
  const title = "Noto";

  // ==========================
  // Auto Sync Saat Online
  // ==========================
  useEffect(() => {
    const runSync = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isAuthenticated || !isOnline || !user) return;

      try {
        if (totalPending > 0) {
          await syncService.syncAll(token, user.id);
        } else {
          await syncService.pullAll(token, user.id);
        }
      } catch (err) {
        console.log("Failed to synchronize data", err);
      }
    };

    runSync();
  }, [isOnline, totalPending, isAuthenticated, user]);

  return (
   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans w-screen mx-auto shadow-2xl relative">

    {/* Header hanya muncul kalau user login */}
    {isAuthenticated && (
      <Header
        title={title}
        isOnline={isOnline}
        pendingSyncCount={totalPending}
      />
    )}

    {/* Content */}
    <main className="p-4 overflow-y-auto h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      {children}
    </main>

    {/* Navbar hanya muncul kalau login */}
    {isAuthenticated && <Navbar />}
  </div>

  );
};


// ==========================
// Routing Utama
// ==========================
const App: React.FC = () => {
  return (
    <Layout>
      <Routes>

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Pages */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <SmartPricing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advisor"
          element={
            <ProtectedRoute>
              <SmartAdvisor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;