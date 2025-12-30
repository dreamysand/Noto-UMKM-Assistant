import React from 'react';
import { Product } from '../types';
import { Package, AlertTriangle, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';

// Props untuk komponen ProductList
interface Props {
  data: Product[]; // Array produk yang akan ditampilkan
  handleDelete: (id?: number) => void; // Fungsi untuk menghapus produk
}

const ProductList: React.FC<Props> = ({ data, handleDelete }) => {
  return (
    <div className="space-y-3">
      {data.map((p) => (
        <div
          key={p.id} // key harus unik untuk setiap elemen list
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start"
        >
          {/* Bagian kiri: icon dan info produk */}
          <div className="flex items-start space-x-3">
            {/* Icon paket */}
            <div className="bg-gray-100 dark:bg-gray-700 p-2.5 rounded-lg text-gray-600 dark:text-gray-200">
              <Package size={20} />
            </div>

            {/* Info produk */}
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">{p.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Rp {p.price.toLocaleString("id-ID")} / {p.unit}
              </p>

              {/* Warning jika stok rendah */}
              {p.stock < 10 && (
                <div className="flex items-center text-orange-600 dark:text-orange-400 text-xs font-bold mt-1">
                  <AlertTriangle size={12} className="mr-1" />
                  Stok Rendah
                </div>
              )}
            </div>
          </div>

          {/* Bagian kanan: jumlah stok dan tombol aksi */}
          <div className="text-right">
            {/* Menampilkan stok */}
            <div className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {p.stock}
            </div>

            {/* Tombol aksi */}
            <div className="flex space-x-2 justify-end">
              {/* Tombol tambah stok */}
              <button
                onClick={async () => await productService.update(p.id!, { stock: p.stock + 1 })}
                className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded flex items-center justify-center text-lg font-bold"
              >
                +
              </button>

              {/* Tombol kurangi stok */}
              <button
                onClick={async () =>
                  await productService.update(p.id!, { stock: Math.max(0, p.stock - 1) })
                }
                className="w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded flex items-center justify-center text-lg font-bold"
              >
                -
              </button>

              {/* Tombol hapus produk */}
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
