// pages/Register.tsx
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Register: React.FC = () => {

  // Untuk redirect setelah register sukses
  const navigate = useNavigate();

  // State untuk toggle show / hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // State untuk menampung input form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  // State loading untuk tombol register
  const [loading, setLoading] = useState(false);

  // State error untuk menampilkan pesan error
  const [error, setError] = useState("");

  // Handle submit form register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();          // mencegah reload halaman default form
    setError("");                // reset error sebelum proses

    // Validasi manual password dan confirm password
    if (formData.password !== formData.password_confirmation) {
      return setError("Password tidak cocok");
    }

    setLoading(true);            // set loading true saat proses request

    try {
      // Kirim data ke API via authService
      const { success, message } = await authService.register(formData);

      alert(message);            // tampilkan pesan dari server

      // Jika sukses, arahkan user ke halaman login
      if (success) {
        navigate('/login');
      }

    } catch (err: any) {
      // Jika error, tampilkan pesan error
      setError(err.message || "Register gagal");
    } finally {
      // Setelah selesai (berhasil/gagal), hentikan loading
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8">

      {/* Header / Judul Halaman */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-green-600/20">
          <UserPlus className="text-white" size={24} />
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold leading-9 text-gray-900 dark:text-white">
          Buat Akun Baru
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Mulai pengelolaan UMKM-mu hari ini
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-red-400">{error}</p>}

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Nama Lengkap
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600"
                  placeholder="John Doe"
                  onChange={(e)=>setFormData({...formData,name:e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600"
                  placeholder="nama@email.com"
                  onChange={(e)=>setFormData({...formData,email:e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword?"text":"password"}
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600"
                  placeholder="••••••••"
                  onChange={(e)=>setFormData({...formData,password:e.target.value})}
                />
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                Confirmation Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswordConfirmation?"text":"password"}
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600"
                  placeholder="••••••••"
                  onChange={(e)=>setFormData({...formData,password_confirmation:e.target.value})}
                />

                <button
                  type="button"
                  onClick={()=>setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition disabled:opacity-70"
            >
              {loading ? "Mendaftarkan..." : "Register"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
};

export default Register;
