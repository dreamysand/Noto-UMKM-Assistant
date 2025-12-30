import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { productService } from '../services/productService';
import { serviceService } from '../services/serviceService';
import { Package, Plus, AlertTriangle, Trash2, Search } from 'lucide-react';
import { Product, Service } from '../types';
import { useAuth } from "../contexts/AuthContext";
import ProductList from '../components/ProductList';
import ServiceList from '../components/ServiceList';

const Inventory: React.FC = () => {
  const { user } = useAuth();

  // --- MODE: Barang atau Jasa ---
  // product = barang
  // service = jasa
  const [mode, setMode] = useState<"product" | "service">("product");

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Ambil data live dari IndexedDB
  const products =
    useLiveQuery(async () => await productService.getAll(user.id)) || [];
  const services =
    useLiveQuery(async () => await serviceService.getAll(user.id)) || [];

  // Filter sesuai tab + search
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredServices = services
    .filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data form
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    stock: 0,
    price: 0,
    unit: 'pcs',
  });

  // Hapus Produk / Jasa
  const handleDelete = async (id?: number) => {
    if (id && confirm('Hapus item ini?')) {
      try {
        if (mode === "product") {
          await productService.remove(id);
        } else {
          await serviceService.remove(id);
        }
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  // Submit Tambah Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (mode === "product") {
        const ret = await productService.create({
          userId: user.id,
          name: formData.name!,
          price: Number(formData.price),
          stock: Number(formData.stock),
          unit: formData.unit || 'pcs',
        });

        if (!ret) return;

        setIsModalOpen(false);
        setFormData({ name: '', stock: 0, price: 0, unit: 'pcs' });
      } else {
        const ret = await serviceService.create({
          userId: user.id,
          name: formData.name!,
          price: Number(formData.price),
          unit: formData.unit || 'menit',
        });

        if (!ret) return;

        setIsModalOpen(false);
        setFormData({ name: '', stock: 0, price: 0, unit: 'pcs' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-4 sm:p-6 rounded-2xl text-white shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold flex items-center">
          <Package className="mr-2" /> Kelola {mode === "product" ? "Barang" : "Jasa"}
        </h2>
        <p className="text-blue-100 dark:text-blue-200 text-xs sm:text-sm mt-1">
          Kelola informasi {mode === "product" ? "stok dan produk." : "layanan / jasa."}
        </p>
      </div>

      {/* TAB SWITCH */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setMode("product")}
          className={`flex-1 py-2 rounded-xl font-bold ${
            mode === "product"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          Barang
        </button>

        <button
          onClick={() => setMode("service")}
          className={`flex-1 py-2 rounded-xl font-bold ${
            mode === "service"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          Jasa
        </button>
      </div>

      {/* Statistik */}
      <div className={`grid gap-3 my-6 ${mode === "product" ? "grid-cols-2" : "grid-cols-1"}`}>

        {/* Total */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">
            Total {mode === "product" ? "Barang" : "Jasa"}
          </p>
          <p className="md:text-2xl text-lg font-bold text-gray-800 dark:text-white mt-1">
            {mode === "product" ? products.length : services.length}
          </p>
        </div>

        {/* Stock Warning hanya untuk BARANG */}
        {mode === "product" && (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase">
              Stok Menipis
            </p>
            <p className="md:text-2xl text-lg font-bold text-gray-800 dark:text-white mt-1">
              {products.filter((p) => p.stock < 10).length}
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" size={18} />
          <input
            type="text"
            placeholder={`Cari ${mode === "product" ? "barang" : "jasa"}...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {mode === "product" && <ProductList data={filteredProducts} handleDelete={handleDelete} />}
        {mode === "service" && <ServiceList data={filteredServices} handleDelete={handleDelete} />}
      </div>

      {/* Floating Add */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 dark:shadow-blue-900/50 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">

            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Tambah {mode === "product" ? "Barang" : "Jasa"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nama */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-300">
                  Nama {mode === "product" ? "Barang" : "Jasa"}
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Stok + Unit hanya untuk BARANG */}
                <div className={`grid gap-3 my-6 ${mode === "product" ? "grid-cols-2" : "grid-cols-1"}`}>
                  {mode === "product" && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-300">
                        Stok Awal
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: Number(e.target.value) })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-300">
                      Satuan
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                    >
                      {mode === "product" ? (
                        <>
                          <option value="pcs">Pcs</option>
                          <option value="kg">Kg</option>
                          <option value="liter">Liter</option>
                          <option value="dus">Dus</option>
                        </>
                      ) : (
                        <>
                          <option value="menit">Menit</option>
                          <option value="jam">Jam</option>
                          <option value="hari">Hari</option>
                          <option value="layanan">Layanan</option>
                          <option value="sesi">Sesi</option>
                          <option value="orang">Orang</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

              {/* Harga */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-300">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>

              {/* Tombol */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700"
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

export default Inventory;
