import React, { useState, useEffect } from "react";
import { Mail, KeyRound, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

// 3 step proses lupa password
// 1 = Masukkan email
// 2 = Verifikasi OTP
// 3 = Reset password
type Step = 1 | 2 | 3;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  // Menyimpan step saat ini
  const [step, setStep] = useState<Step>(1);

  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Timer untuk resend OTP
  const [resendTimer, setResendTimer] = useState(0);

  // Loading state untuk tombol
  const [loading, setLoading] = useState(false);

  // Menampilkan error dan success message
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Menyimpan semua input user
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });

  /**
   * ================= TIMER RESEND OTP =================
   */
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  /**
   * ================= STEP 1 =================
   * Kirim email user ke backend
   * Backend akan kirim OTP ke email user
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validasi sederhana
    if (!formData.email) return setError("Silakan masukkan email");

    try {
      setLoading(true);

      // Panggil API
      const res = await authService.resetPasswordRequest({ email: formData.email });

      // Tampilkan pesan sukses jika ada
      setMessage(res.message || "Kode OTP telah dikirim");

      if (res.success) {
        // Pindah ke step OTP
        setStep(2);
        // Mulai timer resend
        setResendTimer(60);
      }

    } catch (err: any) {
      // Ambil error dari backend jika ada, fallback ke default
      setError(err?.response?.data?.message || err.message || "Gagal mengirim kode reset");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ================= STEP 2 =================
   * Verifikasi kode OTP yang dimasukkan user
   */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const res = await authService.resetPasswordValidate({
        email: formData.email,
        otp: formData.otp,
      });

      setMessage(res.message || "OTP valid");

      // Jika OTP benar lanjut ke reset password
      if (res.success) setStep(3);

    } catch (err: any) {
      setError(err?.response?.data?.message || "Kode OTP salah");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ================= RESEND OTP =================
   * Hanya bisa jika timer = 0
   */
  const resendOtp = async () => {
    if (!formData.email || resendTimer > 0) return;

    try {
      const res = await authService.resendOtp({ email: formData.email });

      if (res.success) {
        setMessage("Kode OTP berhasil dikirim ulang");
        setResendTimer(60); // restart timer
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengirim ulang OTP");
    }
  };

  /**
   * ================= STEP 3 =================
   * Reset password user
   */
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validasi minimal panjang password
    if (formData.password.length < 8)
      return setError("Password minimal 8 karakter");

    // Validasi konfirmasi
    if (formData.password !== formData.password_confirmation)
      return setError("Password tidak cocok");

    try {
      setLoading(true);

      const res = await authService.resetPassword({
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      setMessage(res.message || "Password berhasil direset");

      if (res.success) {
        // Delay sedikit biar user sempat lihat pesan sukses
        setTimeout(() => navigate("/login"), 1200);
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8">
      {/* ================= HEADER WIZARD ================= */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg transition-colors duration-300 ${
            step === 3
              ? "bg-green-600 shadow-green-600/20"
              : "bg-orange-500 shadow-orange-500/20"
          }`}
        >
          {step === 1 && <Mail className="text-white" size={24} />}
          {step === 2 && <KeyRound className="text-white" size={24} />}
          {step === 3 && <CheckCircle className="text-white" size={24} />}
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {step === 1 && "Lupa Password?"}
          {step === 2 && "Verifikasi Keamanan"}
          {step === 3 && "Buat Password Baru"}
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
          {step === 1 && "Masukkan email untuk menerima kode OTP"}
          {step === 2 && `Masukkan kode OTP yang dikirim ke ${formData.email}`}
          {step === 3 && "Pastikan password baru aman"}
        </p>
      </div>

      {/* ================= CARD CONTENT ================= */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10 relative">

          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as Step)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
          {message && <p className="text-green-400 mb-4 text-sm">{message}</p>}

          {/* STEP 1 */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Email
              </label>

              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border-0 py-3 pl-10 
                  ring-1 ring-gray-300 dark:ring-gray-600
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-orange-500"
                  placeholder="email@contoh.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <button
                className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-400 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Kode OTP"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Kode OTP
              </label>

              <input
                type="text"
                maxLength={6}
                className="w-full text-center text-2xl font-bold rounded-xl py-3
                ring-1 ring-gray-300 dark:ring-gray-600
                bg-white dark:bg-gray-900
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-orange-500"
                placeholder="000000"
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") })
                }
              />

              <button
                className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-400 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Memverifikasi..." : "Verifikasi Kode"}
              </button>

              <div className="text-center mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tidak menerima kode?
                </span>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={resendOtp}
                  className={`text-sm font-semibold ${
                    resendTimer > 0
                      ? "text-gray-400 cursor-not-allowed dark:text-gray-500"
                      : "text-orange-600 hover:text-orange-500"
                  }`}
                >
                  {resendTimer > 0
                    ? `Kirim ulang dalam ${resendTimer}s`
                    : "Kirim Ulang"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetSubmit}>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Password Baru
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl py-3 pl-10 pr-10
                  ring-1 ring-gray-300 dark:ring-gray-600
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-white
                  focus:ring-green-600"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-200"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Konfirmasi Password
              </label>

              <div className="relative">
                <CheckCircle className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />

                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  required
                  className={`w-full rounded-xl py-3 pl-10 
                  ring-1 ring-gray-300 dark:ring-gray-600
                  bg-white dark:bg-gray-900
                  text-gray-900 dark:text-white
                  focus:ring-green-600
                  ${
                    formData.password &&
                    formData.password_confirmation &&
                    formData.password !== formData.password_confirmation
                      ? "ring-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-200"
                >
                  {showPasswordConfirmation ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <button
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
