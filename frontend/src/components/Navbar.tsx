import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, NotebookPen, Package, BrainCircuit, Calculator, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Profile from "./Profile";

const Navbar: React.FC = () => {
  // Hook dari react-router untuk mengetahui path halaman yang sedang aktif
  const location = useLocation();

  // Ambil fungsi logout dari AuthContext
  const { logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);

  // Daftar menu navbar (path, label, dan icon)
  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/transactions', label: 'Transaksi', icon: NotebookPen },
    { path: '/pricing', label: 'Pricing', icon: Calculator },
    { path: '/inventory', label: 'Stok', icon: Package },
    { path: '/advisor', label: 'Advisor', icon: BrainCircuit },
  ];

  return (
    <>
      {/* Navbar bottom fixed */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
        <div className="flex justify-around items-center h-16">

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Profile */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <User size={20} />
            <span className="text-[10px] mt-1 font-medium">Profil</span>
          </button>
        </div>
      </nav>

      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </>

  );
};

export default Navbar;
