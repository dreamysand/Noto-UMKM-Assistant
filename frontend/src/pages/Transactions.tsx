import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { transactionService } from '../services/transactionService';
import { syncService } from '../services/syncService';
import { Plus, Search, Filter, NotebookPen } from 'lucide-react';
import { Transaction } from '../types';
import { useAuth } from "../contexts/AuthContext";

const Transactions: React.FC = () => {
  const { user } = useAuth();

  // Ambil token user untuk proses sync ke server
  const token = localStorage.getItem('token') || '';

  // Tambahkan state untuk search
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * useLiveQuery = realtime reactive Dexie
   * Akan otomatis re-render ketika data berubah
   */
  const transactions = useLiveQuery(async () => await transactionService.getLatest(user.id)) || [];

  // Filter transaksi berdasarkan kategori atau deskripsi
  const filteredTransactions = transactions.filter(t =>
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // State modal tambah transaksi
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State form input transaksi
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'income',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // default hari ini
  });

  /**
   * Submit transaksi baru
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.amount || !formData.category) return;

    try {
      // Simpan ke IndexedDB (offline first)
      const ret = await transactionService.create({
        userId: user.id,
        type: formData.type as "income" | "expense",
        amount: Number(formData.amount),
        category: formData.category || "Umum",
        description: formData.description || "",
        date: formData.date!,
      });

      if (!ret) {
        console.log('Failed to add transactions');
        return;
      }

      // Reset form & tutup modal
      setIsModalOpen(false);
      setFormData({
        type: 'income',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

    } catch (err: any) {
      console.error(err.message);
      return;
    }
  };

  return (
    <div className="pb-24 dark:bg-gray-900">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-4 sm:p-6 rounded-2xl text-white shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold flex items-center">
          <NotebookPen className="mr-2" /> Kelola Transaksi
        </h2>
        <p className="text-blue-100 dark:text-blue-200 text-xs sm:text-sm mt-1">
          Kelola pemasukan dan pengeluaran UMKM.
        </p>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="flex space-x-2 my-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ===== LIST TRANSAKSI ===== */}
      <div className="space-y-3">
        {filteredTransactions.map((t) => (
          <div 
            key={t.id} 
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center
            dark:bg-gray-800 dark:border-gray-700"
          >
            {/* Kiri */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${t.type === 'income' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' 
                  : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                }`}
              >
                <span className="text-lg font-bold">
                  {t.type === 'income' ? '↓' : '↑'}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{t.category}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.description || 'Tidak ada keterangan'}
                </p>

                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(t.date).toLocaleDateString('id-ID')} •{" "}
                  {new Date(t.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>

            {/* Kanan */}
            <div className="text-right">
              <p className={`font-bold text-sm ${
                t.type === 'income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
              </p>

              {!t.synced && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded
                dark:bg-orange-900/40 dark:text-orange-400">
                  Pending Sync
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===== BUTTON FLOATING ===== */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all z-40
        dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Plus size={24} />
      </button>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Tambah Transaksi
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.type === 'income' 
                      ? 'bg-white shadow text-green-600 dark:bg-gray-900 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-300'
                  }`}
                >
                  Pemasukan
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.type === 'expense' 
                      ? 'bg-white shadow text-red-600 dark:bg-gray-900 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-300'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-bold
                  dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white
                  dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Pilih Kategori</option>
                  {formData.type === 'expense' && (
                    <>
                      <option value="Bahan Baku">Bahan Baku</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Gaji">Gaji Karyawan</option>
                    </>
                  )}

                  {formData.type === 'income' && (
                    <>
                      <option value="Modal">Modal</option>
                      <option value="Penjualan">Penjualan</option>
                    </>
                  )}

                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none
                  dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors
                  dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors
                  dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
