import React from 'react';
import { Link } from "react-router-dom";
import { Cloud, CloudOff, HelpCircle } from 'lucide-react';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';
import ToggleTheme from "./ToggleTheme";

// Interface untuk mendefinisikan tipe props yang diterima komponen
interface HeaderProps {
  title: string;            // Judul header
  isOnline: boolean;        // Status koneksi (online/offline)
  pendingSyncCount: number; // Jumlah data yang menunggu proses sync
}

// Functional Component Header
const Header: React.FC<HeaderProps> = ({ title, isOnline, pendingSyncCount }) => {
  return (
    <header className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none sticky top-0 z-40 px-4 py-3 flex justify-between items-center">

      <div className="flex items-center">
        {/* Logo Light Mode */}
        <img
          src={logoLight}
          alt="Logo Light"
          className="h-16 w-auto block dark:hidden"
        />

        {/* Logo Dark Mode */}
        <img
          src={logoDark}
          alt="Logo Dark"
          className="h-16 w-auto hidden dark:block"
        />
      </div>

      {/* Wrapper status */}
      <div className="flex items-center space-x-2">

        {isOnline ? (
          <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40 px-2 py-1 rounded-full text-xs font-medium">
            <Cloud size={14} className="mr-1" />
            <span>Online</span>
          </div>
        ) : (
          <div className="flex items-center text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/40 px-2 py-1 rounded-full text-xs font-medium">
            <CloudOff size={14} className="mr-1" />
            <span>Offline</span>
          </div>
        )}

        {/* Badge sync */}
        {pendingSyncCount > 0 && (
          <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-bold">
            {pendingSyncCount} Sync
          </div>
        )}
        <Link
          to="/help"
          className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full
                     bg-purple-100 dark:bg-purple-900/40
                     text-purple-700 dark:text-purple-300
                     hover:bg-purple-200 dark:hover:bg-purple-800
                     transition"
        >
          <HelpCircle size={14} />
          Help
        </Link>
        
        <ToggleTheme />
      
      </div>

    </header>

  );
};

export default Header;
