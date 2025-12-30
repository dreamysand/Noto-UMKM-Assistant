import React from 'react';
import { Product } from '../types';
import { Package, Trash2 } from 'lucide-react';

interface Props {
  data: Product[];
  handleDelete: (id?: number) => void;
}

const ServiceList: React.FC<Props> = ({ data, handleDelete }) => {
  return (
    <div className="space-y-3">
      {data.map((s) => (
        <div
          key={s.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start"
        >
          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-2.5 rounded-lg text-gray-600 dark:text-gray-200">
              <Package size={20} />
            </div>

            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">{s.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Rp {s.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center space-x-2">
            
            <button
              onClick={() => handleDelete(s.id)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
