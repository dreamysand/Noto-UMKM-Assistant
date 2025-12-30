const API_URL = "http://localhost:8000/api/users";

export const authService = {
  // =========================
  // LOGIN
  // =========================
  async login(data: { email: string; password: string }) {
    try {
      // Kirim request login ke backend
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Ambil JSON hasil response
      const response = await res.json();

      // Jika backend kirim success = false → anggap error
      if (!response.success) {
        throw new Error(response.message ?? "Login gagal");
      }

      // Return data penting ke frontend
      return {
        success: response.success,
        message: response.message,
        user: response.data,    // data user
        token: response.token,  // JWT token
      };

    } catch (err) {
      // Jika error (network / server / dll)
      console.log(err);
      return {
        success: false,
        message: err,
        user: null,
        token: '',
      };
    }
  },

  // =========================
  // REGISTER ADMIN
  // =========================
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message ?? "Akun gagal registrasi");
      }

      return {
        success: response.success,
        message: response.message,
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err,
      };
    }
  },

  // =========================
  // REQUEST RESET PASSWORD (KIRIM OTP)
  // =========================
  async resetPasswordRequest(data: { email: string }) {
    try {
      const res = await fetch(`${API_URL}/reset-password-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message ?? "Kode OTP gagal dikirim");
      }

      return {
        success: response.success,
        message: response.message
      };

    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err
      }
    }
  },

  // =========================
  // VALIDASI OTP RESET PASSWORD
  // =========================
  async resetPasswordValidate(data: { email: string; otp: string }) {
    try {
      const res = await fetch(`${API_URL}/reset-password-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message ?? "Kode OTP gagal diverifikasi");
      }

      return {
        success: response.success,
        message: response.message
      };

    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err
      }
    }
  },

  // =========================
  // RESEND OTP
  // =========================
  async resendOtp(data: { email: string }) {
    try {
      const res = await fetch(`${API_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message ?? "Kode OTP gagal dikirim kembali");
      }

      return {
        success: response.success,
        message: response.message
      };

    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err
      }
    }
  },

  // =========================
  // RESET PASSWORD FINAL
  // =========================
  async resetPassword(data: {
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      const res = await fetch(`${API_URL}/reset-password-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message ?? "Password tidak berhasil diganti");
      }

      return {
        success: response.success,
        message: response.message
      };

    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err
      }
    }
  },

  // =========================
  // UPDATE USER
  // =========================
  async updateUser(data: FormData, userId: number, token: string) {
    try {
      // Kirim request update ke backend
      const res = await fetch(`${API_URL}/${userId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });

      // Ambil JSON hasil response
      const response = await res.json();

      // Jika backend kirim success = false → anggap error
      if (!response.success) {
        throw new Error(response.message ?? "Akun gagal diperbarui");
      }

      // Return data penting ke frontend
      return {
        success: response.success,
        message: response.message,
        user: response.data,    // data user
      };

    } catch (err) {
      // Jika error (network / server / dll)
      console.log(err);
      return {
        success: false,
        message: err,
        user: null,
      };
    }
  },

  // =========================
  // LOGOUT
  // =========================
  async logout(token: string) {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // =========================
  // GET DATA USER SAAT INI (ME)
  // =========================
  async me(token: string) {
    const res = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Jika token invalid atau expired
    if (!res.ok) throw new Error("Unauthorized");

    const response = await res.json();

    return response.data; // return data user ke frontend
  },
};