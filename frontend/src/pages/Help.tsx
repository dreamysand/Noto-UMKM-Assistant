import React from "react";
import { HelpCircle, Wallet, Calculator, BarChart3, Sun, Moon } from "lucide-react";


/* ================= COMPONENT ================= */

interface HelpCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function HelpCard({ icon, title, desc }: HelpCardProps) {
  return (
    <div className="
      bg-white dark:bg-gray-900 
      p-4 rounded-xl shadow-md
      border border-gray-200 dark:border-gray-700
      flex items-start gap-3
    ">
      {icon}
      <div>
        <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">
          {title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}


interface FAQProps {
  q: string;
  a: string;
}

function FAQItem({ q, a }: FAQProps) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {q}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {a}
      </p>
    </div>
  );
}


interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionProps) {
  return (
    <div className="
      bg-white dark:bg-gray-900
      p-4 rounded-xl shadow-md 
      border border-gray-200 dark:border-gray-700
    ">
      <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2 text-sm">
        {title}
      </h3>

      {children}
    </div>
  );
}

const Help: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8">
      
      {/* ================= HEADER ================= */}
      <div className="sm:mx-auto sm:w-full">
        <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
          <HelpCircle className="text-white" size={24} />
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Bantuan & Panduan
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Pelajari cara menggunakan aplikasi ini dengan mudah 😊
        </p>
      </div>


      {/* ================= CARD HELP ================= */}
      <div className="mt-8 sm:mx-auto sm:w-full">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10 space-y-6">


          {/* Tujuan Aplikasi */}
          <SectionCard title="🎯 Tujuan Aplikasi">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Aplikasi ini dibuat untuk membantu UMKM mengelola keuangan,
              memantau pemasukan & pengeluaran, menghitung HPP, menentukan harga jual,
              serta melihat performa bisnis dengan mudah.
            </p>
          </SectionCard>


          {/* FITUR */}
          <div className="space-y-3">
            <HelpCard
              icon={<Wallet size={20} className="text-green-500" />}
              title="Ringkasan Keuangan"
              desc="Melihat saldo, profit, pemasukan, dan pengeluaran terbaru secara otomatis."
            />

            <HelpCard
              icon={<Calculator size={20} className="text-blue-500" />}
              title="Smart Pricing (HPP)"
              desc="Masukkan bahan baku + biaya operasional, sistem akan menghitung HPP & memberi saran harga jual."
            />

            <HelpCard
              icon={<BarChart3 size={20} className="text-yellow-500" />}
              title="Grafik & Riwayat"
              desc="Pantau perkembangan bisnis melalui grafik dan riwayat transaksi."
            />

            <HelpCard
              icon={
                <div className="flex">
                  <Sun size={18} className="text-yellow-400 mr-1" />
                  <Moon size={18} className="text-blue-400" />
                </div>
              }
              title="Mode Gelap & Terang"
              desc="Atur tema sesuai kenyamanan mata kamu kapan saja."
            />
          </div>


          {/* ================= SMART PRICING DETAIL ================= */}
          <SectionCard title="🧠 Smart Pricing (HPP) – Cara Kerja">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              Fitur ini membantu kamu menentukan harga jual yang tepat & sehat.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ⚠️ <b>Harga bahan baku</b> yang kamu masukkan adalah
                <span className="text-blue-500 font-semibold"> harga per 1 produk</span>  
                — bukan harga keseluruhan bahan besar.
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-1">
              ✔️ Rumus HPP:
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                HPP = (Bahan Baku per Produk) + (Biaya Operasional per Produk) + (Overhead per Produk)
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-3 mb-1">
              ✔️ Penentuan Harga Jual:
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                Harga Jual = HPP + (HPP × Persentase Profit)
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-3 mb-1">
              📌 Contoh:
            </p>

            <ul className="list-disc text-xs pl-5 text-gray-600 dark:text-gray-400 leading-relaxed">
              <li>Bahan baku per produk = Rp5.000</li>
              <li>Biaya operasional per produk = Rp2.000</li>
              <li>Overhead per produk = Rp2.000</li>
              <li>HPP = Rp9.000</li>
              <li>Profit 30% → Harga jual ≈ Rp11.700 → dibulatkan sistem → Rp12.000</li>
            </ul>
          </SectionCard>



          {/* ================= FAQ ================= */}
          <SectionCard title="❓ FAQ">
            <FAQItem
              q="Apakah bisa untuk UMKM jasa?"
              a="Bisa. Kamu tetap bisa mencatat pemasukan, pengeluaran, dan operasional tanpa stok barang."
            />

            <FAQItem
              q="Apakah data aman?"
              a="Aman. Data disimpan sesuai konfigurasi (local / DB) tergantung aplikasi kamu."
            />

            <FAQItem
              q="Apakah fitur akan bertambah?"
              a="Ya! Aplikasi terus dikembangkan supaya makin membantu UMKM."
            />
          </SectionCard>


          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Butuh bantuan lebih lanjut? Hubungi developer 😊
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;