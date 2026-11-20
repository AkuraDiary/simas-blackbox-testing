# Dokumentasi Matriks Test Cases & Test Case Analysis: Siklus Pengajuan & Penerbitan Surat Balasan (SIMAS)

Dokumen resmi rekapitulasi pengisian 31 baris kasus uji pada tab **"Test Cases"** dan 14 blok perancangan data uji pada tab **"Test Case Analysis"** Google Spreadsheet (`1565c4qhdnLO3XK_uuM7VWCUN86_H29-WeGCuDKt2nDM`).

---

## 1. Tab "Test Cases" (31 Baris Kasus Uji Pengajuan & Terbitan)

*Catatan Format:* Sesuai Aturan Rule 10, kolom `REQUIREMENT ID` hanya diisi pada skenario utama/positif dan dikosongkan pada skenario negatif/alternatif turunan.

| No | REQUIREMENT ID | TEST CASE ID | TEST DESCRIPTION | PRE CONDITIONS | TEST STEPS | TEST INPUT DATA | EXPECTED RESULT | TESTING TYPE | CASE TYPE | TESTER | Hasil (temporary) | Cypress status |
|:--:|:---:|:---:|:---|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 77 | FR-REQ-03 | `TC-FR-REQ-03-A` | Sistem menerbitkan kode pelacakan unik setelah formulir pengajuan berhasil dikirimkan | Pengguna publik berada pada langkah konfirmasi pengajuan surat `/pengajuan` | 1. Klik tombol "Kirim Sekarang"<br>2. Periksa tampilan layar konfirmasi sukses | Formulir pengajuan valid | Layar sukses menampilkan kode pelacakan unik berformat "REQ-" (12 karakter alfanumerik) beserta tombol salin kode tracking | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 78 | | `TC-ALT-FR-REQ-03-A` | Sistem tidak menerbitkan kode pelacakan jika pengiriman formulir dibatalkan atau gagal validasi | Pengguna publik berada pada formulir pengajuan | 1. Batalkan pengisian atau biarkan field mandatory kosong<br>2. Klik tombol Kirim | Data form tidak lengkap | Sistem menahan pengiriman, kode pelacakan tidak digenerate, dan layar tetap berada pada formulir data pengirim | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 88 | | `TC-ALT-FR-PRC-01-A` | Menampilkan pesan status kosong saat kata kunci pencarian pengajuan tidak ditemukan | Login sebagai Staf Unit / Rektorat di `/internal/surat-masuk` | 1. Buka tab filter "Pengajuan"<br>2. Ketikkan kata kunci acak yang tidak terdaftar pada kotak pencarian | Keyword: "PencarianFiktif999XYZ" | Tabel menampilkan pesan status kosong "Tidak Ada Data Surat" dengan ikon representatif | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 89 | FR-PRC-02 | `TC-FR-PRC-02-A` | Staf Unit membuka dan memeriksa lembar detail surat pengajuan | Login sebagai Staf Unit di `/internal/surat-masuk` tab Pengajuan | 1. Klik salah satu baris surat pengajuan<br>2. Periksa kelengkapan halaman detail surat | ID Pengajuan valid | Sistem membuka halaman detail surat, menampilkan panel informasi pengirim, tipe surat "Pengajuan", dan timeline Perjalanan Surat | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 90 | | `TC-ALT-FR-PRC-02-A` | Menampilkan pesan error 404 saat mengakses detail pengajuan dengan ID fiktif | Login sebagai Staf Unit | Akses langsung URL `/internal/surat-masuk/99999999` | ID fiktif: 99999999 | Sistem menolak akses dan menampilkan respons halaman error 404 Not Found | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 91 | FR-PRC-03 | `TC-FR-PRC-03-A` | Staf Unit membuka modal pratinjau dan mengunduh berkas lampiran pemohon | Login sebagai Staf Unit di detail surat pengajuan berlampiran | 1. Gulir ke section Lampiran Berkas<br>2. Klik tombol pratinjau / tautan berkas | Berkas lampiran valid | Sistem menampilkan modal preview berkas (#preview-modal) atau mengunduh dokumen lampiran ke perangkat | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 92 | | `TC-ALT-FR-PRC-03-A` | Menampilkan keterangan tidak ada berkas pada surat pengajuan tanpa lampiran | Login sebagai Staf Unit di detail surat pengajuan tanpa lampiran | 1. Periksa bagian Lampiran Berkas pada lembar detail | Pengajuan tanpa berkas | Halaman menampilkan keterangan informatif "Tidak ada berkas lampiran pada surat ini." | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 93 | FR-PRC-04 | `TC-FR-PRC-04-A` | Staf Unit meneruskan surat pengajuan secara bertingkat ke unit kerja lain | Login sebagai Staf Unit / Rektorat di detail surat pengajuan | 1. Buka dropdown "Proses Surat"<br>2. Pilih "Teruskan Saja (Tanpa Setuju)"<br>3. Pilih unit tujuan dan masukkan catatan<br>4. Konfirmasi penerusan surat | Unit: Unit Kerja Lain, Catatan: "Mohon verifikasi kelayakan berkas akademik" | Pengajuan berhasil diteruskan, riwayat perpindahan tercatat, dan notifikasi sukses ditampilkan | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 94 | | `TC-ALT-FR-PRC-04-A` | Validasi penolakan saat unit tujuan penerusan dikosongkan | Berada pada modal penerusan surat | 1. Kosongkan pilihan unit tujuan<br>2. Klik tombol Submit | Unit tujuan: [Kosong] | Sistem menolak submit dan memunculkan pesan validasi error bahwa unit tujuan wajib dipilih | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 95 | FR-PRC-05-APPROVE | `TC-FR-PRC-05-APPROVE-A` | Pejabat berwenang menyetujui tahapan pengajuan surat | Login sebagai Pejabat Berwenang (Rektorat) di detail pengajuan pending | 1. Buka dropdown "Proses Surat"<br>2. Pilih opsi persetujuan yang tersedia<br>3. Masukkan catatan persetujuan<br>4. Konfirmasi persetujuan | Catatan: "Pengajuan telah diverifikasi dan disetujui" | Surat disetujui, timeline riwayat diperbarui, dan notifikasi sukses persetujuan muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 96 | | `TC-ALT-FR-PRC-05-APPROVE-A` | Aksi persetujuan dinonaktifkan untuk pengguna di luar hak akses | Login sebagai staf unit tanpa wewenang (Logistik) | 1. Buka tab filter "Pengajuan"<br>2. Periksa ketersediaan tombol Proses Surat | Unit tanpa wewenang | Tombol aksi persetujuan ("Proses Surat") tidak tersedia atau dinonaktifkan oleh sistem | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 97 | FR-PRC-05-REVERSE | `TC-FR-PRC-05-REVERSE-A` | Pejabat mengembalikan surat pengajuan ke langkah sebelumnya | Login sebagai Pejabat Berwenang di detail pengajuan | 1. Buka dropdown "Kembalikan / Tolak"<br>2. Pilih "Kembalikan ke Langkah Sebelumnya"<br>3. Masukkan alasan pengembalian<br>4. Konfirmasi pengembalian | Alasan: "Data pendukung belum lengkap dari unit pengusul" | Surat dikembalikan ke unit sebelumnya, status riwayat menjadi REVISI, dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 98 | | `TC-ALT-FR-PRC-05-REVERSE-A` | Validasi mandatory catatan alasan saat mengembalikan pengajuan | Berada pada modal pengembalian surat | 1. Kosongkan textarea catatan alasan<br>2. Klik tombol submit | Catatan alasan: [Kosong] | Sistem menahan pengembalian dan memunculkan validasi error bahwa alasan wajib diisi | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 99 | FR-PRC-05-REVISE | `TC-FR-PRC-05-REVISE-A` | Staf mengembalikan surat pengajuan ke pembuat awal untuk revisi total | Login sebagai Staf di detail surat pengajuan | 1. Buka dropdown "Kembalikan / Tolak"<br>2. Pilih "Kembalikan ke Pembuat Awal (Reset)"<br>3. Masukkan alasan revisi total<br>4. Konfirmasi revisi total | Alasan: "Format naskah wajib disesuaikan dengan template resmi" | Surat dikembalikan ke pembuat awal, status menjadi REVISI, dan tercatat di riwayat | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 100 | | `TC-ALT-FR-PRC-05-REVISE-A` | Validasi mandatory alasan saat melakukan revisi total pengajuan | Berada pada modal pengembalian ke pembuat awal | 1. Kosongkan alasan revisi total<br>2. Klik tombol submit | Alasan revisi: [Kosong] | Sistem menolak submit dan mewajibkan pengisian alasan revisi total | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 101 | FR-PRC-06 | `TC-FR-PRC-06-A` | Staf menyelesaikan pengajuan surat secara mandiri tanpa penerbitan balasan | Login sebagai Staf Unit / Rektorat di detail surat pengajuan | 1. Buka dropdown "Proses Surat"<br>2. Pilih "Finalisasi & Selesai"<br>3. Isi catatan finalisasi<br>4. Konfirmasi finalisasi | Catatan: "Pengajuan permohonan selesai diproses dan diarsipkan" | Status surat berubah menjadi SELESAI, alur pengajuan tuntas, dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 102 | | `TC-ALT-FR-PRC-06-A` | Sistem mencegah penyelesaian ulang pada pengajuan yang telah berstatus selesai | Login sebagai Staf Unit di detail surat pengajuan yang sudah SELESAI | 1. Buka surat pengajuan berstatus SELESAI<br>2. Periksa menu dropdown Proses Surat | Surat berstatus SELESAI | Opsi "Finalisasi & Selesai" tidak lagi ditampilkan untuk mencegah penyelesaian ganda | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 103 | FR-REL-01 | `TC-FR-REL-01-A` | Staf Unit membuat draf surat terbitan balasan dari pengajuan rujukan | Login sebagai Staf Unit di detail pengajuan rujukan | 1. Buka tab filter "Pengajuan"<br>2. Klik salah satu pengajuan masuk<br>3. Buka dropdown "Kelola Surat"<br>4. Klik aksi "Terbitkan Surat Balasan"<br>5. Isi perihal terbitan dinamis<br>6. Klik tombol "Simpan Draft" | ID Pengajuan rujukan, Perihal dinamis | Sistem mengalihkan ke form `/internal/surats/create`, memuat identitas rujukan & banner penerima terbitan, dan menyimpan draf terbitan baru dengan status DRAFT | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 104 | | `TC-ALT-FR-REL-01-A` | Tombol aksi terbitkan surat balasan tidak ditampilkan pada surat bukan pengajuan | Login sebagai Staf Unit di `/internal/surats` atau surat masuk internal | 1. Buka detail surat masuk bertipe selain pengajuan (Internal / Eksternal)<br>2. Buka dropdown "Kelola Surat" | Surat bertipe non-pengajuan | Menu dropdown Kelola Surat tidak menampilkan opsi "Terbitkan Surat Balasan" | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 105 | FR-REL-02 | `TC-FR-REL-02-A` | Staf Unit mengajukan draf surat terbitan ke alur persetujuan bertingkat | Login sebagai Staf Unit di `/internal/surats` | 1. Buka draf terbitan yang baru dibuat<br>2. Klik tombol aksi "Kirim Surat"<br>3. Isi catatan pengantar terbitan<br>4. Konfirmasi pengiriman | Catatan: "Mohon arahan dan persetujuan draf surat balasan resmi" | Modal konfirmasi terbuka, draf diajukan, status berubah menjadi TERKIRIM / DIPROSES, dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 106 | | `TC-ALT-FR-REL-02-A` | Validasi gagal kirim draf terbitan saat form wajib belum lengkap | Login sebagai Staf Unit di `/internal/surats/create?tipe_surat=TERBITAN` | 1. Kosongkan field perihal surat terbitan<br>2. Klik tombol aksi "Kirim / Pengajuan" | Perihal: [Kosong] | Sistem menahan submit form dan menampilkan pesan validasi error pada field perihal yang wajib diisi | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 107 | FR-REL-03-APPROVE | `TC-FR-REL-03-APPROVE-A` | Pimpinan menyetujui draf surat terbitan balasan | Login sebagai Pimpinan (`pakrektor`) di `/internal/surat-masuk` | 1. Buka tab filter "Semua"<br>2. Buka draf surat terbitan yang sedang direview<br>3. Buka dropdown "Proses Surat"<br>4. Pilih opsi persetujuan yang tersedia<br>5. Masukkan catatan persetujuan<br>6. Konfirmasi persetujuan | Catatan: "Draf surat balasan disetujui untuk penomoran resmi" | Modal persetujuan terbuka, surat disetujui, alur persetujuan diperbarui, dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 108 | | `TC-ALT-FR-REL-03-APPROVE-A` | Akses persetujuan terbitan ditolak bagi pengguna di luar alur persetujuan | Login sebagai akun staf tanpa wewenang (`stafflogistik`) di `/internal/surat-masuk` | 1. Buka daftar surat masuk / terbitan<br>2. Periksa ketersediaan tombol Proses Surat | Akun di luar wewenang alur terbitan | Tombol aksi persetujuan "Proses Surat" tidak ditampilkan untuk pengguna di luar alur persetujuan | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 109 | FR-REL-03-REVERSE | `TC-FR-REL-03-REVERSE-A` | Pimpinan mengembalikan draf surat terbitan ke penyusun untuk koreksi redaksi | Login sebagai Pimpinan (`pakrektor`) di detail draf terbitan masuk | 1. Buka dropdown "Kembalikan / Tolak"<br>2. Pilih "Kembalikan ke Langkah Sebelumnya"<br>3. Masukkan catatan koreksi<br>4. Konfirmasi pengembalian | Catatan: "Perbaiki redaksi perihal dan tanggal pelaksanaan" | Modal pengembalian terbuka, draf dikembalikan ke penyusun dengan status REVISI, dan catatan evaluasi terekam | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 110 | | `TC-ALT-FR-REL-03-REVERSE-A` | Validasi wajib isi alasan saat mengembalikan draf terbitan | Berada pada modal pengembalian draf terbitan | 1. Kosongkan textarea alasan pengembalian<br>2. Klik tombol submit | Alasan pengembalian: [Kosong] | Sistem menahan pengembalian dan mewajibkan pengisian alasan pengembalian draf | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 111 | FR-REL-04-REVISE | `TC-FR-REL-04-REVISE-A` | Penyusun memperbarui redaksi konten draf terbitan pasca dikembalikan | Login sebagai Penyusun (`staf`) di `/internal/surats` | 1. Buka draf terbitan yang dikembalikan (status REVISI)<br>2. Klik tombol "Perbaiki Surat"<br>3. Perbarui teks perihal<br>4. Klik "Simpan Draft" | Catatan tambahan perihal: " [Revisi Disetujui]" | Perubahan naskah tersimpan, notifikasi sukses muncul, dan draf siap diajukan ulang ke pimpinan | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 112 | | `TC-ALT-FR-REL-04-REVISE-A` | Sistem mencegah pengeditan konten terbitan yang sudah berstatus selesai | Login sebagai Staf di `/internal/surats` | 1. Buka surat terbitan yang sudah berstatus SELESAI jika ada<br>2. Periksa ketersediaan tombol edit form | Surat terbitan berstatus SELESAI | Form edit dinonaktifkan atau hanya tampilan pratinjau lembar surat yang dapat diakses | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 115 | FR-REL-05-SEND | `TC-FR-REL-05-SEND-A` | Staf Unit memberikan nomor surat resmi dan mempublikasikan surat terbitan final | Login sebagai Staf Unit di `/internal/surats` | 1. Buka draf terbitan yang siap diberi nomor<br>2. Buka dropdown "Kelola Surat"<br>3. Pilih aksi "Beri Nomor Surat"<br>4. Pilih format penomoran unit<br>5. Klik "Terapkan Nomor" | Format penomoran unit BAKU | Nomor surat resmi terpasang, status surat berubah menjadi SELESAI, terbitan otomatis terpublikasi ke pemohon, dan notifikasi sukses muncul | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 116 | | `TC-ALT-FR-REL-05-SEND-A` | Sistem menolak penomoran surat terbitan saat format penomoran tidak dipilih | Berada pada modal penomoran surat | 1. Buka modal penomoran surat<br>2. Kosongkan pilihan format penomoran<br>3. Klik "Terapkan Nomor" | Format penomoran: [Kosong] | Sistem menolak penerapan nomor dan menampilkan pesan validasi error bahwa format nomor wajib dipilih | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |
| 117 | FR-REL-06-ARCHIVE | `TC-FR-REL-06-ARCHIVE-A` | Staf Unit mengarsipkan surat terbitan resmi yang telah berstatus selesai | Login sebagai Staf Unit di detail surat terbitan berstatus SELESAI | 1. Buka dropdown "Kelola Surat"<br>2. Pilih aksi "Arsipkan Surat"<br>3. Pilih kategori arsip<br>4. Konfirmasi pengarsipan | Kategori arsip unit | Modal pengarsipan terbuka, surat berhasil dimasukkan ke repositori arsip unit, dan status arsip terverifikasi | Positive Testing | Normal Case | Seta (Automation QA) | Passed | Automated |
| 118 | | `TC-ALT-FR-REL-06-ARCHIVE-A` | Sistem menolak pengarsipan surat saat kategori arsip tidak dipilih | Berada pada modal pengarsipan surat | 1. Kosongkan pilihan kategori arsip<br>2. Klik tombol simpan arsip | Kategori arsip: [Kosong] | Sistem menolak pengarsipan dan menampilkan pesan validasi error bahwa kategori arsip wajib dipilih | Negative Testing | Boundary Case | Seta (Automation QA) | Passed | Automated |

---

## 2. Tab "Test Case Analysis" (14 Blok Analisis Lengkap)

Setiap blok mematuhi hierarki 3 baris header dan pengelompokan Equivalence Partitioning (Skenario Valid & Invalid) tanpa metode terlarang *Error Guessing*.

```
================================================================================
Analysis for ,FR-REQ-03 (Menerima Kode Pengajuan),,
ID : ,FR-REQ-03 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Sistem menerbitkan kode pelacakan unik | Formulir pengajuan valid dan lengkap | Layar sukses menampilkan kode unik berformat REQ- beserta tombol salin | TC-FR-REQ-03-A
[Invalid]
Skenario Invalid: Pengiriman dibatalkan / gagal validasi | Data formulir kosong / tidak lengkap | Sistem menahan pengiriman dan tidak menerbitkan kode pelacakan | TC-ALT-FR-REQ-03-A
================================================================================

================================================================================
Analysis for ,FR-PRC-03 (Mengelola Lampiran Pengajuan),,
ID : ,FR-PRC-03 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Membuka pratinjau dan mengunduh berkas lampiran | Surat pengajuan memuat berkas lampiran | Sistem menampilkan modal preview (#preview-modal) atau mengunduh dokumen lampiran | TC-FR-PRC-03-A
[Invalid]
Skenario Invalid: Akses lampiran pada surat tanpa berkas | Surat pengajuan tanpa lampiran | Halaman detail menampilkan keterangan "Tidak ada berkas lampiran pada surat ini." | TC-ALT-FR-PRC-03-A
================================================================================

================================================================================
Analysis for ,FR-PRC-04 (Meneruskan Surat Bertingkat),,
ID : ,FR-PRC-04 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Meneruskan surat pengajuan ke unit kerja lain | Unit tujuan dipilih dan catatan valid | Pengajuan berhasil diteruskan, riwayat tercatat, dan notifikasi sukses muncul | TC-FR-PRC-04-A
[Invalid]
Skenario Invalid: Submit penerusan tanpa memilih unit tujuan | Pilihan unit tujuan dikosongkan | Sistem menolak submit dan memunculkan pesan validasi error bahwa unit tujuan wajib dipilih | TC-ALT-FR-PRC-04-A
================================================================================

================================================================================
Analysis for ,FR-PRC-05-APPROVE (Menyetujui Pengajuan),,
ID : ,FR-PRC-05-APPROVE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Pejabat berwenang menyetujui tahapan pengajuan | Akun berwenang dan catatan persetujuan diisi | Surat disetujui, timeline riwayat diperbarui, dan notifikasi sukses muncul | TC-FR-PRC-05-APPROVE-A
[Invalid]
Skenario Invalid: Akses persetujuan oleh pengguna di luar hak akses | Akun staf tanpa wewenang (Logistik) | Tombol aksi persetujuan ("Proses Surat") tidak ditampilkan / dinonaktifkan | TC-ALT-FR-PRC-05-APPROVE-A
================================================================================

================================================================================
Analysis for ,FR-PRC-05-REVERSE (Mengembalikan Pengajuan),,
ID : ,FR-PRC-05-REVERSE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Pejabat mengembalikan surat ke langkah sebelumnya | Alasan pengembalian diisi lengkap | Surat dikembalikan ke langkah sebelumnya dengan catatan evaluasi tersimpan | TC-FR-PRC-05-REVERSE-A
[Invalid]
Skenario Invalid: Mengosongkan catatan alasan saat mengembalikan | Catatan alasan dikosongkan | Sistem menahan submit dan mewajibkan pengisian alasan pengembalian | TC-ALT-FR-PRC-05-REVERSE-A
================================================================================

================================================================================
Analysis for ,FR-PRC-05-REVISE (Merevisi Pengajuan),,
ID : ,FR-PRC-05-REVISE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Mengembalikan surat ke pembuat awal untuk revisi | Alasan revisi total diisi lengkap | Surat dikembalikan ke pembuat awal dengan status REVISI dan tercatat di riwayat | TC-FR-PRC-05-REVISE-A
[Invalid]
Skenario Invalid: Mengosongkan alasan revisi total saat mengembalikan | Alasan revisi total dikosongkan | Sistem menolak submit dan mewajibkan pengisian alasan revisi total | TC-ALT-FR-PRC-05-REVISE-A
================================================================================

================================================================================
Analysis for ,FR-PRC-06 (Menyelesaikan Pengajuan),,
ID : ,FR-PRC-06 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Staf menyelesaikan pengajuan secara mandiri | Catatan finalisasi valid | Status surat berubah menjadi SELESAI, alur pengajuan tuntas, notifikasi sukses muncul | TC-FR-PRC-06-A
[Invalid]
Skenario Invalid: Akses finalisasi ulang pada surat yang sudah selesai | Surat berstatus SELESAI | Sistem tidak lagi menampilkan opsi "Finalisasi & Selesai" untuk mencegah eksekusi ganda | TC-ALT-FR-PRC-06-A
================================================================================

================================================================================
Analysis for ,FR-REL-01 (Membuat Surat Terbitan),,
ID : ,FR-REL-01 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Membuat draf terbitan balasan dari pengajuan rujukan | ID pengajuan rujukan valid dan perihal diisi | Form /create memuat rujukan dan menyimpan draf terbitan baru berstatus DRAFT | TC-FR-REL-01-A
[Invalid]
Skenario Invalid: Akses aksi terbitkan balasan pada surat non-pengajuan | Surat masuk internal / eksternal biasa | Menu dropdown Kelola Surat tidak menampilkan opsi "Terbitkan Surat Balasan" | TC-ALT-FR-REL-01-A
================================================================================

================================================================================
Analysis for ,FR-REL-02 (Mengajukan Penerbitan Bertingkat),,
ID : ,FR-REL-02 - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Mengajukan draf terbitan ke alur persetujuan | Draf terbitan lengkap dan catatan pengantar diisi | Draf diajukan, status berubah menjadi TERKIRIM / DIPROSES, notifikasi sukses muncul | TC-FR-REL-02-A
[Invalid]
Skenario Invalid: Mengajukan draf terbitan dengan form wajib belum lengkap | Perihal draf terbitan dikosongkan | Sistem menahan submit form dan menampilkan validasi error pada perihal | TC-ALT-FR-REL-02-A
================================================================================

================================================================================
Analysis for ,FR-REL-03-APPROVE (Menyetujui Penerbitan),,
ID : ,FR-REL-03-APPROVE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Pimpinan menyetujui draf surat terbitan balasan | Akun pimpinan berwenang dan catatan persetujuan diisi | Surat terbitan disetujui, alur persetujuan diperbarui, dan notifikasi sukses muncul | TC-FR-REL-03-APPROVE-A
[Invalid]
Skenario Invalid: Akses persetujuan terbitan oleh pengguna di luar alur | Akun staf di luar alur (Logistik) | Tombol aksi persetujuan ("Proses Surat") tidak ditampilkan bagi staf di luar alur | TC-ALT-FR-REL-03-APPROVE-A
================================================================================

================================================================================
Analysis for ,FR-REL-03-REVERSE (Mengembalikan Penerbitan),,
ID : ,FR-REL-03-REVERSE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Pimpinan mengembalikan draf terbitan ke penyusun | Catatan koreksi redaksi diisi lengkap | Draf dikembalikan ke penyusun dengan status REVISI dan catatan evaluasi terekam | TC-FR-REL-03-REVERSE-A
[Invalid]
Skenario Invalid: Mengembalikan draf terbitan tanpa mengisi alasan | Catatan alasan pengembalian dikosongkan | Sistem menahan pengembalian dan mewajibkan pengisian alasan pengembalian draf | TC-ALT-FR-REL-03-REVERSE-A
================================================================================

================================================================================
Analysis for ,FR-REL-04-REVISE (Merevisi Draft Penerbitan),,
ID : ,FR-REL-04-REVISE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Penyusun memperbarui redaksi konten draf terbitan | Teks perihal/konten diperbarui sesuai evaluasi | Perubahan naskah tersimpan dan draf siap diajukan kembali ke pimpinan | TC-FR-REL-04-REVISE-A
[Invalid]
Skenario Invalid: Akses pengeditan konten terbitan yang sudah berstatus selesai | Surat terbitan berstatus SELESAI | Form edit dinonaktifkan atau hanya tampilan pratinjau lembar surat yang dapat diakses | TC-ALT-FR-REL-04-REVISE-A
================================================================================

================================================================================
Analysis for ,FR-REL-05-SEND (Mengirimkan Surat Terbitan),,
ID : ,FR-REL-05-SEND - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Memberikan nomor resmi dan mempublikasikan surat terbitan | Format penomoran unit dipilih valid | Nomor resmi terpasang, status berubah SELESAI, dan terbitan terpublikasi ke pemohon | TC-FR-REL-05-SEND-A
[Invalid]
Skenario Invalid: Menerapkan penomoran surat tanpa memilih format penomoran | Pilihan format penomoran dikosongkan | Sistem menolak penerapan nomor dan menampilkan pesan validasi error | TC-ALT-FR-REL-05-SEND-A
================================================================================

================================================================================
Analysis for ,FR-REL-06-ARCHIVE (Mengarsipkan Surat Terbitan),,
ID : ,FR-REL-06-ARCHIVE - DATA,,
Method :,Equivalence Partitioning & Use Case Testing,,
--------------------------------------------------------------------------------
Skenario | Data | Expected Result | Referensi Test Case ID
[Valid]
Skenario Valid: Mengarsipkan surat terbitan resmi berstatus selesai | Kategori klasifikasi arsip dipilih valid | Surat terbitan berhasil dimasukkan ke repositori arsip unit kerja | TC-FR-REL-06-ARCHIVE-A
[Invalid]
Skenario Invalid: Submit pengarsipan tanpa memilih kategori arsip | Pilihan kategori arsip dikosongkan | Sistem menolak pengarsipan dan menampilkan pesan validasi error | TC-ALT-FR-REL-06-ARCHIVE-A
================================================================================
```
