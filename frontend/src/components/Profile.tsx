import { X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile({ onClose }) {
  const { user, logout, updateUser } = useAuth();

  // ================================
  // FORM STATE
  // ================================
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    business_name: user?.business_name || "",
    uri_image: user?.uri_image || "" // url / base64
  });

  const [input, setInput] = useState(""); // confirm logout

  // Set URL avatar
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  // Sync ulang kalau user berubah
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        business_name: user.business_name || "",
        uri_image: user.uri_image || ""
      });
    }
  }, [user]);

  // ================================
  // HANDLE LOGOUT
  // ================================
  const handleLogout = async () => {
    if (input !== "confirm") return alert("Ketik confirm dulu ya");
    await logout();
  };

  // ================================
  // HANDLE UPDATE PROFILE
  // ================================
  const handleSubmit = async () => {
    if (!form.name || !form.email) return alert("Nama & Email wajib diisi");

    try {
      const userId = user.id;

      const formDataObj = new FormData();
      formDataObj.append("_method", "PUT");
      formDataObj.append("name", form.name);
      formDataObj.append("email", form.email);
      formDataObj.append("phone_number", form.phone_number || "");
      formDataObj.append("business_name", form.business_name || "");

      // Jika ada file, append ke FormData
      if (selectedFile) {
        formDataObj.append("uri_image", selectedFile);
      }

      const response = await updateUser(formDataObj, userId);
      alert(response.message);

    } catch (err) {
      alert(err);
    }
  };

  // State tambahan untuk file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ================================
  // HANDLE UPLOAD AVATAR
  // (simpel: convert ke base64 & simpan)
  // ================================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Preview
    setAvatarUrl(URL.createObjectURL(file));
  };

  // Use effect untuk get avatar
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/users/image/${user.uri_image}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (!res.ok) return;
        
        const blob = await res.blob();
        
        setAvatarUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Avatar gagal dimuat");
      }
    };

    fetchAvatar();
  }, [user]);


  // Ambil inisial dari nama
  const getInitial = () =>
    form.name ? form.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-[420px] shadow-2xl border border-gray-200 dark:border-gray-700">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Profil Akun
          </h1>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-4" />

        {/* ================= AVATAR ================= */}
        <div className="flex flex-col items-center mb-4">
          
          {
            avatarUrl || user?.uri_image ? (
              <img
                className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                alt="Avatar"
                src={avatarUrl ? avatarUrl : `http://localhost:8000/storage/${user.uri_image}`}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {getInitial()}
              </div>
            )
          }

          {/* Upload Button */}
          <label className="mt-3 text-sm cursor-pointer bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition">
            Ganti Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-3">

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              Nama
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              Nomor Telepon
            </label>
            <input
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="0812xxxx"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">
              Nama Usaha
            </label>
            <input
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="UMKM mu apa?"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold"
          >
            Simpan Perubahan
          </button>
        </div>

        {/* ================= LOGOUT ================= */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4" />

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ketik{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">
            confirm
          </span>{" "}
          untuk melanjutkan logout.
        </p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-md w-full px-3 py-2 mt-2 outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="confirm"
        />

        <button
          disabled={input !== "confirm"}
          onClick={handleLogout}
          className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold transition 
            ${
              input === "confirm"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-400 dark:bg-gray-700 text-gray-200 cursor-not-allowed"
            }`}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
