import React from 'react';

// Tipe props untuk SummaryCard
interface SummaryCardProps {
  title: string;        // Judul card 
  value: number;        // Nilai angka yang akan ditampilkan
  icon: React.ReactNode; // Icon yang dikirim dari parent (bebas: lucide-react / svg / apapun)
  colorClass: string;   // Class warna untuk icon background (tailwind class)
}

// Functional Component SummaryCard
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    // Wrapper utama card
    <div className="p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center space-x-4">

      {/* Wrapper icon */}
      <div className={`${colorClass} bg-opacity-10 dark:bg-opacity-20 lg:p-3 md:p-2 rounded-full`}>
        {icon}
      </div>

      {/* Bagian teks */}
      <div>
        {/* Judul kecil */}
        <p className="lg:text-xs text-[0.6rem] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          {title}
        </p>

        {/* Nilai uang */}
        <p className="lg:text-lg md:text-sm text-[0.75rem] font-bold text-gray-800 dark:text-gray-100">
          Rp {value}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
