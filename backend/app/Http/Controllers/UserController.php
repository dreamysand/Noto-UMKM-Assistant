<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\User; 

class UserController extends Controller
{
    /**
     * Mendapatkan profile user yang sedang login
     */
    public function me()
    {
        try {
            $current_user = Auth::guard('api')->user();

            return response()->json([
                'success' => true,
                'data' => $current_user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     * ➤ Validasi email & password
     * ➤ Cek kecocokan password
     * ➤ Generate Sanctum Token
     */
    public function login(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            // Cari user berdasarkan email
            $user = User::where('email', $request->email)->first();

            // Jika user tidak ada atau password salah
            if (! $user || ! Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Email atau password salah'],
                ]);
            }

            // Generate token login
            $token = $user->createToken('admin_token')->plainTextToken;

            // Update last login
            $user->update([
                'last_login' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'token' => $token,
                'data' => $user,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Register user Baru
     */
    public function register(Request $request)
    {
        try {
            // Validasi data
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed', 
            ]);

            // Cek email apakah sudah dipakai
            $is_email_exist = User::where('email', $request->email)->exists();

            if ($is_email_exist) {
                throw ValidationException::withMessages([
                    'email' => ['Email sudah terdaftar'],
                ]);   
            }

            // Simpan user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil registrasi',
                'data' => $user,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request Reset Password
     * ➤ Generate OTP
     * ➤ Simpan ke DB
     * ➤ Kirim email OTP
     */
    public function resetPasswordRequest(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user) {
                throw ValidationException::withMessages([
                    'email' => ['Email tidak ditemukan'],
                ]);
            }

            // Generate OTP 6 digit
            $otp = rand(100000, 999999);

            // Simpan otp + expired time
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => Carbon::now()->addMinutes(2)
            ]);

            // Kirim email
            Mail::send('emails.reset-password-otp', [
                'user' => $user,
                'otp' => $otp
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Your Reset Password Code');
            });

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP berhasil dikirim ke email tertuju',
                'otp_expires_at' => $user->otp_expires_at
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validasi OTP Reset Password
     */
    public function resetPasswordValidate(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'otp' => 'required|digits:6'
            ]);

            $user = User::where('email', $request->email)->first();

            // ⚠️ NOTE: pastikan fieldnya sama (otp vs otp_code)
            if (($request->otp != $user->otp_code) || (now() > $user->otp_expires_at)) {
                throw ValidationException::withMessages([
                    'otp' => ['Kode OTP tidak valid atau sesi telah usai'],
                ]);
            }

            // Clear OTP setelah valid
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Otp berhasil divalidasi'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kirim ulang OTP
     */
    public function resendOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            $user = User::where('email', $request->email)->first();

            $otp = rand(100000, 999999);

            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => Carbon::now()->addMinutes(2)
            ]);

            Mail::send('emails.reset_password_otp', [
                'user' => $user,
                'otp' => $otp
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Your Reset Password Code');
            });

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP berhasil dikirim ke email tertuju',
                'otp_expires_at' => $user->otp_expires_at
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Proses ganti password setelah OTP valid
     */
    public function resetPasswordProcess(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6|confirmed'
            ]);

            $user =  User::where('email', $request->email)->first();

            if (! $user) {
                throw ValidationException::withMessages([
                    'email' => ['Email tidak ditemukan'],
                ]);
            }

            // Update password
            $user->update([
                'password' => bcrypt($request->password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password telah berhasil diganti'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage(),
            ], 500);   
        }
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name'          => 'required|string|max:255',
                'business_name' => 'nullable|string|max:255',
                'email'         => 'required|email',
                'phone_number'  => ['nullable', 'regex:/^(0\d{8,14}|\+?[1-9]\d{7,14})$/'],
                'uri_image'     => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5096'
            ]);

            // Cek email duplikat
            if (
                User::where('email', $request->email)
                    ->where('id', '!=', $user->id)
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'email' => ['Email sudah terdaftar'],
                ]);
            }

            // Data yang diupdate
            $updateData = [
                'name'          => $request->name,
                'email'         => $request->email,
                'business_name' => $request->business_name,
                'phone_number'  => $request->phone_number,
            ];

            // Handle Image
            if ($request->hasFile('uri_image')) {

                // Hapus image lama kalau ada
                if ($user->uri_image && Storage::disk('private')->exists($user->uri_image)) {
                    Storage::disk('private')->delete($user->uri_image);
                }

                // Simpan image baru
                $path = $request->file('uri_image')->store('users', 'private');
                $updateData['uri_image'] = $path;
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil diperbarui',
                'data' => $user
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout()
    {
        try {
            $user = Auth::guard('api')->user();

            if (! $user) {
                throw ValidationException::withMessages([
                    'user' => ['Akun tidak ditemukan.'],
                ]);  
            }

            // Delete token yang sedang dipakai
            $user->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->getMessage()
            ], 500);
        }
    }
}
