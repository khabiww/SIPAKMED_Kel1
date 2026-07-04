
# SIPAKMED — Sistem Pakar Medis

Aplikasi web sistem pakar diagnosis penyakit berbasis Forward Chaining, dengan area publik untuk konsultasi dan area admin untuk mengelola basis pengetahuan.

## 1. Backend (Lovable Cloud / Supabase)

Aktifkan Lovable Cloud, lalu buat skema:

- `penyakit` (id uuid PK, kode_penyakit, nama_penyakit, kategori, deskripsi, saran_penanganan)
- `gejala` (id uuid PK, kode_gejala, nama_gejala, kategori)
- `rule` (id uuid PK, kode_rule, id_penyakit FK)
- `rule_gejala` (id_rule FK, id_gejala FK, PK gabungan)
- `riwayat_diagnosis` (id uuid PK, tanggal timestamptz, hasil_penyakit_id FK nullable, hasil_nama text, gejala_dipilih jsonb, status text)
- `user_roles` + enum `app_role` + fungsi `has_role()` (pola aman anti-recursive)

RLS:
- SELECT publik (anon+authenticated) untuk `penyakit`, `gejala`, `rule`, `rule_gejala`
- INSERT publik untuk `riwayat_diagnosis`; SELECT hanya admin
- CRUD penuh hanya untuk role `admin`
- GRANT eksplisit sesuai kebijakan

Seed data: 12 aturan R01–R10 + penyakit + gejala unik lewat migrasi.

Autentikasi: Supabase Auth email/password untuk admin. Setelah signup admin pertama, role `admin` diberikan via query di dashboard Cloud (dijelaskan ke user).

## 2. Design System

- Primary: emerald-600 `#059669`, aksen teal/cyan
- Background putih bersih, foreground slate gelap
- Token semantik didefinisikan di `src/styles.css` (oklch): `--primary`, `--accent`, `--medical-gradient`, `--shadow-card`
- Font: Inter (body) + Plus Jakarta Sans (heading) via `<link>` di root head
- Komponen shadcn dengan varian medis; loading state pakai `Loader2` dari Lucide

## 3. Route Architecture (TanStack Start)

Struktur file (setiap route punya `head()` metadata sendiri):

```text
src/routes/
  __root.tsx           # shell + PublicLayout wrapper
  index.tsx            # Beranda (hero + CTA "Mulai Diagnosis")
  tentang.tsx          # Info Forward Chaining + disclaimer
  diagnosis.tsx        # Konsultasi (searchable checkbox gejala, dikelompokkan)
  hasil.tsx            # Hasil diagnosis (kartu penyakit + saran)
  auth.tsx             # Login admin (publik)
  _authenticated/
    route.tsx          # gate managed integration
    admin.tsx          # layout admin (sidebar) → Outlet
    admin.index.tsx    # Dashboard statistik
    admin.penyakit.tsx # CRUD penyakit
    admin.gejala.tsx   # CRUD gejala
    admin.rule.tsx     # CRUD aturan (pilih penyakit + multi-gejala)
    admin.riwayat.tsx  # Log riwayat diagnosis
```

Navigasi publik: navbar responsif (hamburger sheet di mobile). Admin: sidebar shadcn collapsible dengan `SidebarTrigger`.

## 4. Halaman Publik

- **Beranda**: hero gradient hijau-putih, ilustrasi/ikon medis Lucide, CTA besar → `/diagnosis`, section fitur singkat.
- **Tentang**: penjelasan metode Forward Chaining, daftar 12 penyakit yang didukung (dari DB), disclaimer.
- **Diagnosis**: 
  - Fetch semua gejala via TanStack Query (public server fn)
  - Input search + accordion per kategori gejala + checkbox
  - Tombol "Analisis Diagnosis" → jalankan inference client-side
  - Banner disclaimer di atas
- **Hasil**: 
  - Terima gejala terpilih via router state (search params id sesi)
  - Tampilkan penyakit yang FIRED (full match), atau fallback ramah
  - Kartu: nama, kategori, deskripsi, gejala terkonfirmasi (badge), blok "Saran Penanganan Awal" (hijau muted)
  - Simpan ke `riwayat_diagnosis`
  - Disclaimer

## 5. Mesin Inferensi Forward Chaining

Fungsi murni `runInference(selectedSymptomIds, rules)`:
1. Untuk setiap rule, cek `rule_gejala.every(g => selected.includes(g))`
2. Jika full match → rule FIRED, kumpulkan penyakit
3. Return:
   - `single`: 1 penyakit → tampilkan detail
   - `multiple`: >1 penyakit cocok → fallback "tidak dapat ditentukan"
   - `none`: 0 cocok → fallback

## 6. Area Admin

- Login `/auth` → setelah sukses, cek `has_role('admin')`; jika bukan admin, sign-out + toast
- Dashboard: 4 kartu statistik (count query)
- CRUD (Dialog + Form + Table shadcn) untuk penyakit, gejala, rule
- Kelola Aturan: form pilih penyakit + multi-select gejala (Command + Checkbox), simpan ke `rule` + `rule_gejala`
- Riwayat: tabel readonly + filter tanggal

## 7. Server Functions

- `getPublicKnowledge` — fetch penyakit/gejala/rule/rule_gejala (publishable client, RLS anon SELECT)
- `saveDiagnosis` — insert `riwayat_diagnosis` (publishable client)
- `getAdminStats`, `getRiwayat`, dan CRUD mutations → `requireSupabaseAuth` + cek admin role
- File di `src/lib/*.functions.ts`

## Detail Teknis

- TanStack Query + `ensureQueryData` di loader `_authenticated/*`, `useSuspenseQuery` di komponen
- Toast via `sonner`
- Validasi form via `zod` + `react-hook-form`
- Loading: `<Loader2 className="animate-spin" />`
- Semua data persisten di Supabase; seed via migration

## Yang Tidak Termasuk

- Registrasi admin publik (admin dibuat manual + role di-grant lewat SQL)
- Multi-bahasa (default Bahasa Indonesia)
- Ekspor laporan PDF

Setelah plan disetujui, saya akan mengaktifkan Lovable Cloud terlebih dahulu, lalu membangun skema, seeding, dan UI secara bertahap.
