import React, { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Ambil fungsi login dari AuthContext
  const { login } = useAuth();

  // State untuk menampilkan / menyembunyikan password
  const [showPassword, setShowPassword] = useState(false);

  // State untuk form input
  const [formData, setFormData] = useState({ email: '', password: '' });

  // State loading saat proses login berjalan
  const [loading, setLoading] = useState(false);

  // State untuk menampilkan error jika login gagal
  const [error, setError] = useState("");
  
  // Handler ketika user submit form login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Panggil fungsi login dari context
      const { success, message } = await login(formData);

      // Tampilkan pesan dari server
      alert(message);

      // Jika login berhasil, arahkan ke dashboard / home
      if (success) {
        navigate('/')
      }

    } catch (err: any) {
      // Jika error, tampilkan pesan error
      setError(err.message || "Login gagal");
    } finally {
      // Matikan loading setelah selesai
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8">
      
      {/* Header / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
          <LogIn className="text-white" size={24} />
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Masuk ke Akun
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Kelola UMKM dengan lebih mudah
        </p>
      </div>

      {/* Card Form Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && <p className="text-red-400">{error}</p>}

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Email
              </label>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 transition"
                  placeholder="nama@email.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Password
                </label>

                <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                  Lupa password?
                </Link>
              </div>

              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-blue-600 transition"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol */}
            <div>
              <button
                disabled={loading}
                type="submit"
                className="flex w-full justify-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-70"
              >
                {loading ? "Masuk..." : "Login"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Daftar disini
            </Link>
          </p>

        </div>
      </div>
    </div>

  );
};

export default Login;
