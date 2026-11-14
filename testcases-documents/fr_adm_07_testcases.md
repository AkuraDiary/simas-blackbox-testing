# Dokumentasi Spesifikasi dan Pengujian: FR-ADM-07 (Manajemen Konfigurasi dan Token Layanan AI)

Dokumen ini memuat spesifikasi use case UC-ADM-07, spesifikasi functional requirement FR-ADM-07, tabel matriks kasus uji 13 kolom baku (No. 136 s.d. 141), serta blok perancangan data uji Test Case Analysis menggunakan metode Use Case Testing dan Equivalence Partitioning (EQP) tanpa metode Error Guessing.

---

## 1. Spesifikasi Kebutuhan Perangkat Lunak

### 1.1 Spesifikasi Use Case: UC-ADM-07

| Atribut Use Case | Penjelasan |
| :--- | :--- |
| **Kode Use Case** | UC-ADM-07 |
| **Nama Use Case** | Mengelola Konfigurasi dan Token Layanan AI |
| **Aktor** | Administrator Sistem |
| **Deskripsi** | Administrator mengelola kredensial token AI multi-provider (Google Gemini dan Ollama), memilih satu token aktif utama, mengatur status sakelar aktivasi fitur pembuatan naskah dinas secara global, dan memantau status operasional kesiapan token. |
| **Kondisi Awal (Pre-conditions)** | Administrator telah terautentikasi ke panel internal SIMAS dan membuka menu navigasi Konfigurasi AI. |
| **Kondisi Akhir (Post-conditions)** | Kredensial token tersimpan di basis data dengan kunci API tersamar, token aktif diperbarui, sakelar fitur tersimpan, dan antarmuka pembuatan surat staf menyesuaikan ketersediaan tombol bantuan AI secara langsung. |

#### Alur Kejadian Utama (Main Flow)
1. Administrator mengakses menu "Konfigurasi AI" pada kelompok navigasi Master Data / Administrasi.
2. Sistem menampilkan ringkasan status operasional AI (status fitur aktif atau nonaktif, sumber token aktif saat ini: Pangkalan Data / Fallback .env / Peringatan Belum Dikonfigurasi) beserta tabel daftar token yang tersimpan.
3. Administrator menekan tombol "Tambah Token Baru".
4. Sistem memunculkan jendela modal formulir penambahan token.
5. Administrator memilih provider (Google Gemini atau Ollama), mengisi label pengenal, memasukkan API key atau Base URL, dan memilih model target.
6. Administrator menekan tombol "Simpan".
7. Sistem memvalidasi kelengkapan isian formulir, menyimpan rekaman baru ke tabel `ai_tokens`, dan menampilkan notifikasi sukses dengan kunci API tersamar pada tabel.
8. Administrator menekan tombol aksi "Aktifkan" pada salah satu baris token.
9. Sistem menetapkan token terpilih menjadi aktif (`is_active = true`), menonaktifkan token lainnya secara otomatis, dan memperbarui ringkasan status operasional.
10. Administrator dapat menggeser sakelar toggle "Fitur Asisten AI" untuk mematikan atau menyalakan fitur bantuan pembuatan draf surat bagi seluruh staf secara terpusat.

#### Alur Kejadian Alternatif / Eksepsi (Alternative Flow)
- **3a. Validasi Isian Wajib Kosong**: Jika Administrator mengosongkan kolom wajib (seperti label atau kredensial API key), sistem menolak pengiriman formulir dan menampilkan pesan kesalahan validasi pada kolom terkait (`TC-ALT-FR-ADM-07-A`).
- **8a. Penghapusan Token Aktif dan Fallback Otomatis**: Jika Administrator menghapus token aktif di basis data, sistem melakukan penghapusan logis (soft delete). Saat staf memicu pembuatan naskah AI, layanan resolver `AiDraftManager` secara otomatis beralih (graceful fallback) ke konfigurasi kredensial pada berkas `.env` server tanpa menghentikan ketersediaan layanan.
- **8b. Penanganan Kondisi Ketiadaan Token (Zero-Token Handling)**: Jika tidak ada token aktif di basis data dan konfigurasi `.env` juga kosong, sistem tidak mengalami fatal crash. Halaman admin menampilkan status peringatan bahwa kredensial belum tersedia, sedangkan pada formulir staf muncul notifikasi santun yang menginformasikan bahwa asisten naskah dinas belum dapat digunakan karena konfigurasi kredensial belum dilengkapi oleh Administrator.

---

### 1.2 Spesifikasi Functional Requirement: FR-ADM-07

| Atribut Kebutuhan | Penjelasan |
| :--- | :--- |
| **Kode FR** | FR-ADM-07 |
| **Modul** | Administrasi Sistem |
| **Sub-Modul** | Konfigurasi AI |
| **Nama Kebutuhan** | Manajemen Konfigurasi dan Token Layanan AI |
| **Deskripsi Kebutuhan** | Sistem harus memungkinkan Administrator untuk mengelola kredensial token AI multi-provider (Google Gemini dan Ollama), menetapkan satu token aktif utama, mengatur sakelar toggle aktivasi fitur naskah dinas secara global, serta mendukung peralihan otomatis (graceful fallback) ke konfigurasi environment (.env) dan penanganan ketiadaan kredensial (zero-token handling). |
| **User Story** | Sebagai Administrator, saya ingin mengelola konfigurasi dan kredensial token layanan AI serta mengatur status aktivasi fitur secara terpusat, sehingga integrasi asisten naskah dinas dapat dikontrol, dipantau, dan dialihkan penyedianya secara fleksibel tanpa mengubah berkas konfigurasi server. |
| **Aktor Pengguna** | Administrator |

---

## 2. Matriks Kasus Uji (Tab "Test Cases" - Format 13 Kolom Baku)

Sesuai Aturan Rule 10, kolom `REQUIREMENT ID` hanya diisi pada baris pertama skenario positif utama (`TC-FR-ADM-07-A`) dan dikosongkan pada baris kasus turunan/alternatif.

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | PRE CONDITIONS | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT | TESTING TYPE | CASE TYPE | TESTER | Hasil (temporary) | Cypress status |
|:--:|:---:|:---:|:---|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 136 | FR-ADM-07 | `TC-FR-ADM-07-A` | Administrator menambahkan kredensial token Google Gemini baru yang valid | Administrator login dan mengakses halaman menu "Konfigurasi AI" | 1. Klik tombol "Tambah Token Baru"<br>2. Pilih provider "Google Gemini"<br>3. Masukkan label "Token Gemini Kampus"<br>4. Masukkan API Key "AIzaSyDummyKeyValid123" dan Model "gemini-2.5-flash"<br>5. Klik tombol "Simpan" | Provider: "gemini", Label: "Token Gemini Kampus", API Key: "AIzaSyDummyKeyValid123", Model: "gemini-2.5-flash" | Token berhasil ditambahkan ke daftar, kunci API ditampilkan secara tersamar (masked), dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 137 | | `TC-ALT-FR-ADM-07-A` | Validasi penolakan penambahan token saat field formulir wajib dikosongkan | Modal formulir tambah token AI terbuka | 1. Buka modal tambah token baru<br>2. Kosongkan field provider, label, dan API key<br>3. Klik tombol "Simpan" | Field formulir token: [Kosong] | Sistem menolak penyimpanan dan menampilkan pesan validasi error bahwa kolom wajib diisi | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 138 | | `TC-FR-ADM-07-B` | Administrator mengaktifkan token Gemini sebagai token layanan utama sistem | Terdapat token Gemini nonaktif pada tabel Konfigurasi AI | 1. Cari baris token "Token Gemini Kampus"<br>2. Klik tombol aksi "Aktifkan"<br>3. Konfirmasi pengaktifan | ID Token Gemini valid | Status token berubah menjadi Aktif (badge hijau), token lain otomatis nonaktif, dan widget status memperbarui sumber aktif | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 139 | | `TC-FR-ADM-07-C` | Administrator menambahkan dan mengaktifkan token Ollama lokal kampus | Administrator berada pada halaman Konfigurasi AI | 1. Klik "Tambah Token Baru"<br>2. Pilih provider "Ollama"<br>3. Isi label "Ollama Server Kampus" dan Base URL "http://localhost:11434"<br>4. Simpan dan klik aksi "Aktifkan" | Provider: "ollama", Label: "Ollama Server Kampus", Base URL: "http://localhost:11434", Model: "gpt-oss:20b" | Token Ollama tersimpan dan status aktif berhasil dialihkan ke penyedia Ollama | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 140 | | `TC-FR-ADM-07-D` | Administrator mematikan toggle fitur asisten AI secara global | Sakelar fitur asisten AI berstatus aktif | 1. Klik sakelar toggle "Fitur Asisten AI" menjadi nonaktif (OFF)<br>2. Konfirmasi perubahan status<br>3. Buka formulir draf surat staf | Toggle state: OFF (Nonaktif) | Sistem menonaktifkan fitur AI secara global, tombol "Bantuan AI (Draft Surat)" otomatis disembunyikan dari formulir staf | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 141 | | `TC-FR-ADM-07-E` | Administrator menyalakan kembali toggle fitur asisten AI secara global | Sakelar fitur asisten AI berstatus nonaktif | 1. Klik sakelar toggle "Fitur Asisten AI" menjadi aktif (ON)<br>2. Konfirmasi perubahan status<br>3. Buka formulir draf surat staf | Toggle state: ON (Aktif) | Sistem mengaktifkan kembali fitur AI, tombol "Bantuan AI (Draft Surat)" muncul kembali pada formulir pembuatan surat staf | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |

---

## 3. Blok Analisis Pengujian (Tab "Test Case Analysis")

Sesuai aturan Rule 10 dan Rule 11, perancangan kasus uji berlandaskan pada pendekatan Use Case Testing dan Equivalence Partitioning (EQP) yang membagi ruang uji ke dalam Skenario Valid dan Skenario Invalid. Metode Error Guessing tidak digunakan.

```tsv
Analysis for 	FR-ADM-07 (Manajemen Konfigurasi dan Token Layanan AI)		
ID : 	FR-ADM-07 - DATA		
Method :	Equivalence Partitioning & Use Case Testing		
Valid Scenario			
Skenario	Data	Expected Result	Referensi Test Case ID
Administrator menambahkan kredensial token Google Gemini valid	Provider: "gemini", Label: "Token Gemini Kampus", API Key valid, Model: "gemini-2.5-flash"	Token berhasil disimpan, ditampilkan dengan API key tersamar, dan notifikasi sukses muncul	TC-FR-ADM-07-A
Administrator mengaktifkan token Gemini sebagai token utama	ID Token Gemini valid	Status token berubah menjadi Aktif, token lain otomatis nonaktif, widget status terbarui	TC-FR-ADM-07-B
Administrator menambahkan dan mengaktifkan token penyedia Ollama	Provider: "ollama", Base URL: "http://localhost:11434", Model: "gpt-oss:20b"	Token Ollama tersimpan dan status aktif berhasil dialihkan ke penyedia Ollama	TC-FR-ADM-07-C
Administrator mematikan sakelar toggle fitur asisten AI secara global	Sakelar toggle disetel ke nonaktif (OFF)	Fitur dinonaktifkan secara terpusat, tombol Bantuan AI pada formulir staf disembunyikan	TC-FR-ADM-07-D
Administrator menyalakan kembali sakelar toggle fitur asisten AI	Sakelar toggle disetel ke aktif (ON)	Fitur diaktifkan kembali, tombol Bantuan AI muncul kembali pada formulir staf	TC-FR-ADM-07-E
			
Invalid Scenario			
Skenario	Data	Expected Result	Referensi Test Case ID
Validasi formulir saat kolom wajib penambahan token dikosongkan	Field provider, label, dan kredensial token: [Kosong]	Sistem menolak penyimpanan dan menampilkan pesan kesalahan validasi pada kolom wajib	TC-ALT-FR-ADM-07-A
```

---

## 4. Rekonsiliasi Metrik Pengujian Sistem

Penambahan spesifikasi FR-ADM-07 menghasilkan rekonsiliasi metrik pengujian fungsional sistem sebagai berikut:
1. **Total Functional Requirement (FR)**: Meningkat dari 52 FR menjadi **53 FR**.
2. **Total Kasus Uji Fungsional Pengguna (RTM)**: Meningkat dari 135 kasus menjadi **141 kasus uji** (No. 136 s.d. 141).
3. **Total Berkas Spesifikasi Fitur Cypress**: Meningkat dari 33 berkas fitur menjadi **34 berkas fitur** (`cypress/e2e/features/admin/fr_adm_07_ai_token.feature`).
4. **Total Skenario Uji Runner (Mochawesome)**: Meningkat dari 138 skenario menjadi **145 skenario runner** (100% kelulusan).
5. **Penjelasan Ilmiah Selisih +4 Skenario Runner**:
   Selisih 4 skenario antara matriks kebutuhan pengguna (141 kasus) dan pelari uji otomatis (145 skenario) merupakan skenario keandalan teknis pada lapisan pendukung pengujian:
   - 1 skenario pengujian koneksi pihak ketiga WhatsApp Gateway Fonnte (`TC-FR-NOTIF-03-A`) pada endpoint pemeriksaan perangkat non-kuota.
   - 2 skenario pengujian stabilitas infrastruktur autentikasi (`TC-AUTH-CUSTOM` untuk perintah login programatik dan `TC-AUTH-LOGOUT` untuk terminasi sesi aman).
   - 1 skenario manajemen siklus hidup data uji (`TC-TEARDOWN-ADM-07`) untuk membersihkan rekaman token uji dinamis dan mengembalikan status sakelar ke posisi default aktif.
