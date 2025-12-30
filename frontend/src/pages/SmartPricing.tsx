import React, { useState } from 'react';
import { Plus, Trash2, Calculator, TrendingUp, ShieldCheck, Award } from 'lucide-react';

// Interface untuk struktur data bahan (ingredient)
interface Ingredient {
  id: number;
  name: string;
  cost: number;
}

// Interface untuk struktur data cost item (operasional dan overhead)
interface CostItem {
  id: number;
  name: string;
  cost: number;
}

const SmartPricing: React.FC = () => {

  // State untuk daftar bahan (HPP)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: '', cost: 0 }
  ]);

  // Biaya operasional (listrik, air, gaji, dll)
  const [operationals, setOperationals] = useState<CostItem[]>([
    { id: 1, name: '', cost: 0 }
  ]);

  // Overhead 
  const [overhead, setOverhead] = useState<CostItem>({ id: 1, name: 'Overhead', cost: 0 });

  // State untuk menyimpan harga kompetitor (opsional)
  const [competitorPrice, setCompetitorPrice] = useState<number>(0);

  // State untuk menentukan apakah hasil pricing sudah dihitung atau belum
  const [calculated, setCalculated] = useState(false);

  // Fungsi tambah item
  const addItem = (type: 'ingredient' | 'operational') => {
    const newItem = { id: Date.now(), name: '', cost: 0 };
    if (type === 'ingredient') setIngredients([...ingredients, newItem]);
    else setOperationals([...operationals, newItem]);
  };

  // Hapus item
  const removeItem = (type: 'ingredient' | 'operational', id: number) => {
    if (type === 'ingredient') setIngredients(ingredients.filter(i => i.id !== id));
    else setOperationals(operationals.filter(i => i.id !== id));
  };

  // Update item
  const updateItem = (
    type: 'ingredient' | 'operational' | 'overhead',
    id: number,
    field: 'name' | 'cost',
    value: string | number
  ) => {
    if (type === 'ingredient') {
      setIngredients(
        ingredients.map(i => (i.id === id ? { ...i, [field]: value } : i))
      );
    } else if (type === 'operational') {
      setOperationals(
        operationals.map(o => (o.id === id ? { ...o, [field]: value } : o))
      );
    } else if (type === 'overhead') {
      setOverhead({ ...overhead, [field]: value });
    }
  };

  // Total HPP & total biaya
  const totalIngredients = ingredients.reduce((sum, i) => sum + i.cost, 0);
  const totalOperational = operationals.reduce((sum, o) => sum + o.cost, 0);
  const totalHPP = totalIngredients + totalOperational;
  const totalCost = totalHPP + overhead.cost;

  // Strategi penetapan harga
  const competitivePrice = totalCost * 1.15; // +15%
  const safePrice = totalCost * 1.30;        // +30%
  const premiumPrice = totalCost * 1.50;     // +50%

  // Menampilkan hasil pricing jika HPP sudah ada
  const handleCalculate = () => {
    if (totalHPP > 0) setCalculated(true);
  };

  // Analisis perbandingan dengan harga kompetitor
  const getCompetitorAnalysis = (ourPrice: number) => {
    if (!competitorPrice) return null;
    
    if (ourPrice < competitorPrice) 
      return { text: "Lebih Murah", color: "text-green-600" };
    
    if (ourPrice > competitorPrice) 
      return { text: "Lebih Mahal", color: "text-red-600" };

    return { text: "Setara", color: "text-gray-600" };
  };

  return (
    <div className="pb-24 space-y-6">

      {/* ==============================
          HEADER
      =============================== */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-5 rounded-2xl text-white shadow">
        <h2 className="text-lg sm:text-xl font-bold flex items-center">
          <Calculator className="mr-2" /> Smart Pricing
        </h2>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          Hitung HPP dan tentukan harga jual ideal secara cepat & akurat.
        </p>
      </div>

      {/* ==============================
          CARD INPUT SECTION
      =============================== */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-700 space-y-5">

        {/* ========= BAHAN BAKU (HPP) ========= */}
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
            Bahan Baku (HPP) Per Produk
          </h3>

          <div className="space-y-2">
            {ingredients.map((i, idx) => (
              <div key={i.id} className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 dark:text-gray-300 w-4">{idx+1}.</span>

                {/* Nama Bahan */}
                <input
                  type="text"
                  placeholder="Nama Bahan"
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={i.name}
                  onChange={e => updateItem('ingredient', i.id, 'name', e.target.value)}
                />

                {/* Harga */}
                <input
                  type="number"
                  placeholder="Rp"
                  className="w-28 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-right"
                  value={i.cost || ''}
                  onChange={e => updateItem('ingredient', i.id, 'cost', Number(e.target.value))}
                />

                {ingredients.length > 1 && (
                  <button
                    onClick={() => removeItem('ingredient', i.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => addItem('ingredient')}
            className="mt-2 text-blue-500 flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" /> Tambah Bahan
          </button>
        </div>

        {/* ========= OPERASIONAL ========= */}
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
            Biaya Operasional Per Produk
          </h3>

          <div className="space-y-2">
            {operationals.map((o, idx) => (
              <div key={o.id} className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 dark:text-gray-300 w-4">{idx+1}.</span>

                <input
                  type="text"
                  placeholder="Nama Operasional"
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={o.name}
                  onChange={e => updateItem('operational', o.id, 'name', e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Rp"
                  className="w-28 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-right"
                  value={o.cost || ''}
                  onChange={e => updateItem('operational', o.id, 'cost', Number(e.target.value))}
                />

                {operationals.length > 1 && (
                  <button
                    onClick={() => removeItem('operational', o.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => addItem('operational')}
            className="mt-2 text-blue-500 flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" /> Tambah Operasional
          </button>
        </div>

        {/* ========= OVERHEAD ========= */}
        <div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
            Overhead Per Produk
          </h3>

          <input
            type="number"
            placeholder="Rp Overhead"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-right"
            value={overhead.cost || ''}
            onChange={e => updateItem('overhead', overhead.id, 'cost', Number(e.target.value))}
          />
        </div>

        {/* ========= TOTAL ========= */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

          {/* Harga Kompetitor */}
          <div className="flex justify-between items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Harga Kompetitor (Opsional)
            </span>

            <input
              type="number"
              placeholder="Rp 0"
              className="w-32 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm text-right"
              value={competitorPrice || ''}
              onChange={(e) => setCompetitorPrice(Number(e.target.value))}
            />
          </div>

          {/* Total HPP */}
          <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <span className="font-bold text-gray-700 dark:text-gray-200">
              Total HPP
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              Rp {totalCost.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* ========= BUTTON ========= */}
        <button
          onClick={handleCalculate}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow transition"
        >
          Hitung Rekomendasi Harga
        </button>
      </div>


      {/* ==============================
          HASIL PERHITUNGAN
      =============================== */}
      {calculated && (
        <div className="space-y-4">

          <h3 className="font-bold text-gray-700 dark:text-gray-200 ml-1">
            Rekomendasi Harga Jual
          </h3>

          {/* ================= COMPETITIVE ================= */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-blue-600 flex items-center">
                  <TrendingUp size={16} className="mr-1" /> Kompetitif (+15%)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bagus untuk persaingan ketat.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Rp {competitivePrice.toLocaleString('id-ID')}
                </p>

                {competitorPrice > 0 && (
                  <p className={`text-xs font-bold ${getCompetitorAnalysis(competitivePrice)?.color}`}>
                    {getCompetitorAnalysis(competitivePrice)?.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= SAFE ================= */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-green-600 flex items-center">
                  <ShieldCheck size={16} className="mr-1" /> Harga Aman (+30%)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Margin aman untuk operasional jangka panjang.
                </p>

                <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-[10px] px-2 py-1 rounded-full font-bold">
                  Rekomendasi Utama
                </span>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rp {safePrice.toLocaleString('id-ID')}
                </p>

                {competitorPrice > 0 && (
                  <p className={`text-xs font-bold ${getCompetitorAnalysis(safePrice)?.color}`}>
                    {getCompetitorAnalysis(safePrice)?.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= PREMIUM ================= */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-purple-600 flex items-center">
                  <Award size={16} className="mr-1" /> Premium (+50%)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cocok untuk brand kualitas tinggi & loyal customer.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Rp {premiumPrice.toLocaleString('id-ID')}
                </p>

                {competitorPrice > 0 && (
                  <p className={`text-xs font-bold ${getCompetitorAnalysis(premiumPrice)?.color}`}>
                    {getCompetitorAnalysis(premiumPrice)?.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>


  );
};

export default SmartPricing;