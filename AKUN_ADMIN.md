# Akun Administrator SIPAKMED

Berikut adalah informasi akun administrator untuk login ke panel admin SIPAKMED (Sistem Pakar Medis):

### 🔑 Kredensial Login
* **Email:** `admin@sipakmed.id`
* **Password:** `admin123` *(Silakan sesuaikan/ganti dengan password yang aman saat registrasi)*

---

### ℹ️ Catatan Penting (Fungsi Auto-Claim Admin)
Sistem ini menggunakan fitur **Claim Admin if First** pada database Supabase:
* Jika database Anda masih baru/kosong, **akun pertama** yang mendaftar atau login ke sistem secara otomatis akan mendapatkan role **Admin** (`role: 'admin'`).
* Akun berikutnya yang mendaftar hanya akan memiliki role **User** biasa dan tidak dapat mengakses halaman `/admin`.

---

### 📂 Halaman Login Admin
Halaman login admin dapat diakses melalui link `/auth` pada aplikasi.
