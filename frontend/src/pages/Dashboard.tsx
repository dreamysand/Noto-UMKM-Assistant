import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { transactionService } from '../services/transactionService';
import { TrendingUp, TrendingDown, Wallet, HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // ================================
  // Ambil data transaksi dari IndexedDB secara realtime
  // useLiveQuery akan auto refresh kalau data berubah
  // ================================
  const transactions = useLiveQuery(async () => await transactionService.getAll(user.id)) || [];

  // State untuk ringkasan (total pemasukan, pengeluaran, saldo)
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, profit: 0 });

  // ================================
  // Hitung ulang summary ketika transaksi berubah
  // ================================
  useEffect(() => {
    if (transactions) {
      // Total pemasukan
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Total pengeluaran
      const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Total keuntungan
      const totalSale = transactions
        .filter((t) => t.category === 'Penjualan')
        .reduce((sum, t) => sum + t.amount, 0);

      // Set hasil ke summary
      setSummary({ income, expense, balance: income - expense, profit: totalSale - expense });
    }
  }, [transactions]);

  // ================================
  // Hitung omset
  // ================================
  function totalSaleByPeriod(transactions, period) {
    const now = new Date();

    return transactions
      .filter(t => t.category === 'Penjualan')
      .filter(t => {
        const date = new Date(t.date);

        switch(period) {
          case 'today':
            return date.toDateString() === now.toDateString();
          case 'thisWeek': {
            // Hari minggu dianggap hari pertama
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0,0,0,0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23,59,59,999);

            return date >= startOfWeek && date <= endOfWeek;
          }
          case 'thisMonth':
            return date.getMonth() === now.getMonth() &&
                   date.getFullYear() === now.getFullYear();
          case 'thisYear':
            return date.getFullYear() === now.getFullYear();
          default:
            return true; // Semua data
        }
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // ================================
  // Ambil 7 transaksi terakhir untuk grafik
  // ================================
  const chartData = transactions.slice(-7).map((t) => ({
    name: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    amount: t.amount,
    type: t.type,
  }));

  // ================================
  // Fungsi bikin halaman print pakai iframe
  // Tujuannya biar styling print terpisah,
  // dan tidak mengganggu halaman utama
  // ================================
  const printReport = (contentHtml: string) => {
    const iframe = document.createElement("iframe");

    // Disembunyikan (tapi tetap ada di DOM)
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow!.document;

    // Tulis HTML khusus print
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Laporan Keuangan</title>
          <style>
            /* =========================
               BASIC PAGE
            ========================= */
            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            .min-h-screen,
            .h-screen {
              min-height: auto !important;
              height: auto !important;
            }

            .section {
              page-break-inside: avoid;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            #print-area {
              width: 100%;
            }

            /* =========================
               GRID & LAYOUT
            ========================= */
            .grid {
              display: grid;
            }

            .grid-cols-2 {
              grid-template-columns: repeat(2, 1fr);
            }

            .grid-cols-4 {
              grid-template-columns: repeat(4, 1fr);
            }

            .gap-3 {
              gap: 12px;
            }

            .mt-4 {
              margin-top: 16px;
            }

            .my-4 {
              margin-top: 16px;
              margin-bottom: 16px;
            }

            /* =========================
               CARD BASE
            ========================= */
            .bg-white {
              background: #ffffff;
            }

            .p-4 {
              padding: 16px;
            }

            .rounded-xl {
              border-radius: 14px;
            }

            .shadow-sm {
              box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            }

            .border {
              border: 1px solid #ddd;
            }

            .border-gray-100 {
              border-color: #e5e7eb;
            }

            /* =========================
               TEXT
            ========================= */
            .text-sm {
              font-size: 13px;
            }

            .text-xs {
              font-size: 11px;
            }

            .font-bold {
              font-weight: 700;
            }

            .font-semibold {
              font-weight: 600;
            }

            .text-gray-700 {
              color: #374151;
            }

            .text-gray-400 {
              color: #9ca3af;
            }

            /* =========================
               COLORS
            ========================= */
            .bg-green-100 {
              background: #e7f7eb;
            }

            .bg-red-100 {
              background: #fde8e8;
            }

            .text-green-600 {
              color: #16a34a;
            }

            .text-red-600 {
              color: #dc2626;
            }

            /* =========================
               LIST / RIWAYAT
            ========================= */
            .space-y-3 > * + * {
              margin-top: 12px;
            }

            .flex {
              display: flex;
            }

            .justify-between {
              justify-content: space-between;
            }

            .items-center {
              align-items: center;
            }

            .py-2 {
              padding-top: 8px;
              padding-bottom: 8px;
            }

            .border-b {
              border-bottom: 1px solid #eee;
            }


            /* =========================
               CHART (Recharts)
            ========================= */
            .recharts-wrapper {
              position: relative;
              width: 90%;
              height: 250px;
            }
          </style>  
        </head>

        <body>
          <div class="report-container">
            <h2 class="title">Laporan Keuangan</h2>
            <p class="date">${new Date().toLocaleString("id-ID")}</p>

            ${contentHtml}
          </div>
        </body>
      </html>
    `);

    doc.close();

    // Fokus & trigger print
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    // Hapus iframe setelah print
    setTimeout(() => document.body.removeChild(iframe), 500);
  };

  // ================================
  // Ambil isi elemen print-area
  // lalu kirim ke fungsi print
  // ================================
  const handlePrint = () => {
    const content = document.getElementById("print-area")?.innerHTML || "";
    printReport(content);
  };

  // ================================
  // Format angka
  // ================================
  function formatNumber(value) {
    if (value >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(1) + " T"; // Triliun
    if (value >= 1_000_000_000)     return (value / 1_000_000_000).toFixed(1) + " M"; // Miliar
    // if (value >= 1_000_000)         return (value / 1_000_000).toFixed(1) + " Jt";    // Juta
    return value.toLocaleString("id-ID"); // Ribu ke bawah pakai format normal
  }

  return (
    <div className="pb-24 space-y-6">

      {/* ================================
            Kartu saldo utama
         ================================ */}
      <div className="grid grid-cols-1 gap-4">
        <div className="
          bg-gradient-to-r 
          from-blue-500 to-indigo-600 
          dark:from-blue-700 dark:to-indigo-900
          rounded-2xl 
          p-6 
          text-white
          shadow-xl
          border border-white/10
         ">
          
          <p className="text-blue-100 text-sm font-medium mb-1">
            Saldo Saat Ini
          </p>

          {/* Warna tetap readable saat minus */}
          <h2
            className={`text-3xl font-bold transition-all ${
              summary.balance < 0 
                ? "text-red-300" 
                : "text-white"
            }`}
          >
            Rp {formatNumber(summary.balance)}
          </h2>

          {/* Profit indicator */}
          <span
            className={`text-xs font-bold ${
              summary.profit < 0 
                ? "text-red-300" 
                : "text-green-300"
            }`}
          >
            Profit : {summary.profit < 0 ? "-" : "+"} Rp {formatNumber(Math.abs(summary.profit))}
          </span>

          {/* Status arus kas */}
          <div
            className={`mt-4 flex items-center text-xs px-3 py-2 rounded-lg w-fit backdrop-blur-sm
              ${
                summary.balance < 0
                  ? "text-red-200 bg-red-800/40 border border-red-700/40"
                  : "text-green-100 bg-green-800/40 border border-green-700/40"
              }
            `}
          >
            <Wallet size={14} className="mr-2" />
            <span>
              {summary.balance < 0 ? "Arus Kas Rugi" : "Arus Kas Aman"}
            </span>
          </div>
        </div>
      </div>

      {/* ================================
            Semua area yang akan diprint
         ================================ */}
      <div id="print-area">

        {/* ================================
                Ringkasan Pemasukan / Pengeluaran
           ================================ */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Pemasukan"
            value={formatNumber(summary.income)}
            icon={<TrendingUp size={24} className="text-green-600 dark:text-green-400" />}
            
            // warna dibuat lembut agar tidak silau
            colorClass="
              bg-green-50 
              dark:bg-green-900/30 
              border border-green-200/40 
              dark:border-green-800
            "
          />

          <SummaryCard
            title="Pengeluaran"
            value={formatNumber(summary.expense)}
            icon={<TrendingDown size={24} className="text-red-600 dark:text-red-400" />}
            colorClass="
              bg-red-50 
              dark:bg-red-900/30 
              border border-red-200/40 
              dark:border-red-800
            "
          />
        </div>

        {/* ================================
              Ringkasan Omset
           ================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          {[
            { label: "Omset Hari Ini", period: "today" },
            { label: "Omset Minggu Ini", period: "thisWeek" },
            { label: "Omset Bulan Ini", period: "thisMonth" },
            { label: "Omset Tahun Ini", period: "thisYear" },
          ].map((o, i) => (
            <SummaryCard
              key={i}
              title={o.label}
              value={formatNumber(totalSaleByPeriod(transactions, o.period))}
              icon={<HandCoins size={24} className="text-yellow-600 dark:text-yellow-400" />}
              colorClass="
                bg-yellow-50 
                dark:bg-yellow-900/30 
                border border-yellow-200/40 
                dark:border-yellow-800
              "
            />
          ))}
        </div>

        {/* ================================
              Grafik Transaksi
           ================================ */}
        <div className="
          bg-white 
          dark:bg-gray-900 
          p-4 
          rounded-xl 
          shadow-md 
          border border-gray-200 
          dark:border-gray-700
          transition-all
        ">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
            Grafik Transaksi Terakhir
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />

                <Tooltip
                  formatter={(value: number) => `Rp ${formatNumber(value)}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                  }}
                />

                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.type === "income" ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ================================
              Riwayat Transaksi
           ================================ */}
        <div className="
          bg-white 
          dark:bg-gray-900 
          p-4 
          rounded-xl 
          shadow-md 
          border border-gray-200 
          dark:border-gray-700
          mt-4
        ">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
            Riwayat Terkini
          </h3>

          <div className="space-y-3">
            {transactions.slice().reverse().slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="
                  flex justify-between items-center 
                  py-2 
                  border-b border-gray-200 
                  dark:border-gray-700 
                  last:border-0
                "
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {t.category}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(t.date).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <p
                  className={`text-sm font-bold ${
                    t.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"} Rp{" "}
                  {t.amount.toLocaleString("id-ID")}
                </p>
              </div>
            ))}

            {/* Kosong */}
            {transactions.length === 0 && (
              <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">
                Belum ada transaksi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================================
            Tombol Print
         ================================ */}
      <button
        onClick={handlePrint}
        className="
          px-4 py-2 
          bg-blue-600 
          hover:bg-blue-700
          dark:bg-blue-700 
          dark:hover:bg-blue-800
          text-white 
          rounded-lg 
          shadow
          transition
        "
      >
        Print Laporan
      </button>
    </div>

  );
};

export default Dashboard;
