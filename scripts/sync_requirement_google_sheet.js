/**
 * Google Apps Script untuk Menyelaraskan Dokumen Requirement SIMAS
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/1jcGDnmAoht1WHBk3pA0L9IeWd1xWD6av1zfZLPcBFfs/edit
 * 
 * Cara Penggunaan:
 * 1. Buka spreadsheet Requirement Elsimas di atas
 * 2. Klik Extensions (Ekstensi) > Apps Script
 * 3. Hapus kode default, paste seluruh kode ini
 * 4. Klik tombol "Run" (Jalankan) dengan fungsi: syncRequirementSpreadsheet
 * 5. Berikan izin saat pertama kali dijalankan. Selesai!
 */

function syncRequirementSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetRefined = ss.getSheetByName("Requirement Refined");
  const sheetRTM = ss.getSheetByName("Usecase RTM");

  if (!sheetRefined) {
    throw new Error("Sheet 'Requirement Refined' tidak ditemukan!");
  }

  Logger.log("Memulai sinkronisasi Dokumen Requirement...");

  // 1. UPDATE TAB 'Requirement Refined'
  // Data 52 FR terstandarisasi (Modul terisi lengkap, typo Menerrima diperbaiki, penamaan selaras UAT & Test Case)
  const refinedData = [
  [
    "1.0",
    "Autentikasi",
    "Auth",
    "FR-AUTH-01",
    "Autentikasi (Login)",
    "User dapat melakukan login menggunakan username & password yang sudah terdaftar",
    "Sebagai Pengguna (Admin, Pegawai, Mahasiswa), saya ingin melakukan autentikasi dengan username dan kata sandi, sehingga saya dapat masuk ke dalam sistem dengan aman.",
    "Admin, Pegawai, Mahasiswa"
  ],
  [
    "2.0",
    "Administrasi Sistem",
    "Mengelola Struktur Organisasi",
    "FR-ADM-01",
    "Mengelola Struktur Organisasi",
    "Admin dapat mengatur hierarki unit organisasi beserta relasi antar akun personel di setiap unit sebagai dasar alur persuratan.",
    "Sebagai Admin, saya ingin mengelola struktur organisasi, sehingga saya dapat mengatur hierarki dan relasi antar akun sebagai landasan alur persuratan.",
    "Admin"
  ],
  [
    "3.0",
    "Administrasi Sistem",
    "Mengelola Akun Pengguna",
    "FR-ADM-02",
    "Mengelola Akun Pengguna",
    "Admin dapat menambahkan, mengubah, menonaktifkan, dan menghapus akun pengguna dalam sistem.",
    "Sebagai Admin, saya ingin mengelola akun pengguna (menambahkan, mengubah, menonaktifkan, menghapus), sehingga saya dapat mengontrol siapa saja yang memiliki hak akses ke dalam sistem.",
    "Admin"
  ],
  [
    "4.0",
    "Administrasi Sistem",
    "Mengimpor Data Pengguna",
    "FR-ADM-03",
    "Mengimpor Data Pengguna",
    "Admin dapat mengimpor data pengguna secara massal melalui file sheet (.csv) untuk mempercepat pembuatan akun.",
    "Sebagai Admin, saya ingin mengimpor data pengguna secara massal menggunakan file spreadsheet (.csv), sehingga saya dapat mempercepat proses pembuatan akun secara kolektif.",
    "Admin"
  ],
  [
    "5.0",
    "Administrasi Sistem",
    "Mengelola Template Surat",
    "FR-ADM-04",
    "Mengelola Template Surat",
    "Admin dapat membuat, mengubah, dan menghapus template surat yang digunakan dalam pembuatan surat.",
    "Sebagai Admin, saya ingin mengelola template surat (membuat, mengubah, menghapus), sehingga sistem memiliki format standar yang siap digunakan oleh pengguna.",
    "Admin"
  ],
  [
    "6.0",
    "Administrasi Sistem",
    "Mengelola Kategori Template",
    "FR-ADM-05",
    "Mengelola Kategori Template",
    "Admin dapat mengelompokkan template surat berdasarkan kategori tertentu untuk membedakan akses dan penggunaan (termasuk titik awal, hingga pengiriman)",
    "Sebagai Admin, saya ingin mengelola kategori template surat, sehingga saya bisa mengelompokkan template untuk membedakan hak akses dan penggunaannya di berbagai unit maupun dari pihak luar.",
    "Admin"
  ],
  [
    "7.0",
    "Administrasi Sistem",
    "Mengelola Template Nomor Surat",
    "FR-ADM-06",
    "Mengelola Template Nomor Surat",
    "Admin dapat mengelola template nomor surat yang digunakan di institusi",
    "Sebagai Admin, saya ingin mengelola template nomor surat, agar penomoran surat selaras dengan kebijakan",
    "Admin"
  ],
  [
    "8.0",
    "NDE",
    "Pemrosesan Surat",
    "FR-SRT-01",
    "Membuat Draft Surat",
    "Pegawai dapat membuat draft surat baru berdasarkan template yang tersedia atau dari awal.",
    "Sebagai Pegawai, saya ingin membuat draft surat baru menggunakan template yang tersedia atau dari awal, sehingga saya bisa memulai proses pembuatan dokumen NDE.",
    "Pegawai"
  ],
  [
    "9.0",
    "NDE",
    "Pemrosesan Surat",
    "FR-SRT-02",
    "Mengedit Draft Surat",
    "Pegawai dapat melakukan perubahan terhadap draft surat sebelum dikirim atau diproses lebih lanjut.",
    "Sebagai Pegawai, saya ingin mengedit draft surat, sehingga saya dapat melakukan perbaikan atau penyesuaian sebelum surat dikirim.",
    "Pegawai"
  ],
  [
    "10.0",
    "NDE",
    "Pemrosesan Surat",
    "FR-SRT-03",
    "Menghasilkan Draft Dengan Bantuan AI",
    "Pegawai dapat menggunakan chat AI untuk membantu membuat isi surat",
    "Sebagai Pegawai, saya ingin menggunakan asisten AI, sehingga saya mendapatkan bantuan untuk menyusun isi surat dengan lebih cepat dan terstruktur.",
    "Pegawai"
  ],
  [
    "11.0",
    "NDE",
    "Pengiriman Surat",
    "FR-SRT-04",
    "Mengirim / Meneruskan Surat",
    "Mengirim surat sebagai terusan secara langsung maupun bertingkat",
    "Sebagai Pegawai, saya ingin mengirim atau meneruskan surat (secara langsung maupun bertingkat), sehingga dokumen dapat didistribusikan ke tujuan yang tepat.",
    "Pegawai"
  ],
  [
    "12.0",
    "NDE",
    "Pengembalian Surat",
    "FR-SRT-05",
    "Mengembalikan Surat",
    "Mengembalikan surat ke pengirim awal atau ke pengirim sebelumnya (bertingkat)",
    "Sebagai Pegawai, saya ingin mengembalikan surat ke pengirim awal atau sebelumnya, sehingga saya bisa meminta perbaikan jika terdapat kesalahan pada dokumen.",
    "Pegawai"
  ],
  [
    "13.0",
    "NDE",
    "Surat Masuk",
    "FR-SRT-06",
    "Melihat Daftar Surat Masuk",
    "Pegawai dapat melihat daftar seluruh surat yang diterima oleh unitnya",
    "Sebagai Pegawai, saya ingin melihat daftar seluruh surat masuk, sehingga saya bisa memantau dokumen apa saja yang telah diterima oleh unit saya.",
    "Pegawai"
  ],
  [
    "14.0",
    "NDE",
    "Pencarian Surat",
    "FR-SRT-07",
    "Mencari Surat",
    "Pegawai dapat mencari surat berdasarkan perihal dan/atau pengirim.",
    "Sebagai Pegawai, saya ingin mencari surat berdasarkan perihal atau pengirim, sehingga saya dapat menemukan dokumen spesifik yang saya butuhkan dengan cepat.",
    "Pegawai"
  ],
  [
    "15.0",
    "NDE",
    "Detail Surat",
    "FR-SRT-08",
    "Melihat Detail Surat",
    "Pegawai melihat informasi lengkap surat yang mencakup isi, pengirim, tujuan, lembar disposisi (bagi surat disposisi) dan dokumen lampiran surat.",
    "Sebagai Pegawai, saya ingin melihat detail surat (isi, pengirim, tujuan, lampiran, dan lembar disposisi), sehingga saya bisa memahami konteks dokumen tersebut secara utuh.",
    "Pegawai"
  ],
  [
    "16.0",
    "NDE",
    "Alur Surat",
    "FR-SRT-09",
    "Melihat Alur Surat",
    "Pegawai  melihat riwayat dan alur distribusi surat dari awal hingga posisi saat ini.",
    "Sebagai Pegawai, saya ingin melihat alur surat, sehingga saya mengetahui riwayat distribusi dan posisi dokumen saat ini.",
    "Pegawai"
  ],
  [
    "17.0",
    "NDE",
    "Respon Surat",
    "FR-SRT-10",
    "Memberikan Respon terhadap Surat",
    "Pegawai memberikan respon berupa catatan atau tindak lanjut terhadap surat yang diterima.",
    "Sebagai Pegawai, saya ingin memberikan respons berupa catatan terhadap surat yang diterima, sehingga saya bisa menentukan tindak lanjut dari dokumen tersebut.",
    "Pegawai"
  ],
  [
    "18.0",
    "NDE",
    "Akses Dokumen",
    "FR-SRT-11",
    "Mengakses Dokumen Surat",
    "Pegawai melihat dan mengunduh dokumen, lampiran, dan lembar disposisi surat",
    "Sebagai Pegawai, saya ingin mengunduh dokumen surat, lampiran, dan lembar disposisi, sehingga saya memiliki salinan arsip digital dari dokumen terkait.",
    "Pegawai"
  ],
  [
    "19.0",
    "NDE",
    "Disposisi",
    "FR-DISP-01",
    "Melakukan Disposisi Surat",
    "Pegawai  mendisposisikan surat ke unit atau pihak lain beserta instruksi tindak lanjut.",
    "Sebagai Pegawai, saya ingin mendisposisikan surat ke pihak lain beserta instruksinya, sehingga tugas yang ada di dalam surat dapat didelegasikan dengan jelas.",
    "Pegawai"
  ],
  [
    "20.0",
    "NDE",
    "Respon Disposisi",
    "FR-DISP-02",
    "Merespon Disposisi",
    "Pegawai  memberikan respon atas disposisi yang diterima sesuai instruksi yang diberikan.",
    "Sebagai Pegawai, saya ingin merespons disposisi yang diterima, sehingga saya dapat melaporkan status tindak lanjut sesuai instruksi yang diberikan.",
    "Pegawai"
  ],
  [
    "21.0",
    "NDE",
    "Riwayat Disposisi",
    "FR-DISP-03",
    "Melihat Riwayat Perjalanan Surat",
    "Pegawai  melihat riwayat perjalanan surat beserta status tindak lanjutnya.",
    "Sebagai Pegawai, saya ingin melihat riwayat dan status alur disposisi, sehingga saya bisa memantau perkembangan penyelesaian tugas tersebut.",
    "Pegawai"
  ],
  [
    "22.0",
    "Persuratan",
    "Pengajuan Surat",
    "FR-REQ-01",
    "Mengajukan Surat",
    "Pengguna  mengajukan permohonan surat dengan mengisi data dan mengunggah dokumen pendukung.",
    "Sebagai Mahasiswa / Guest, saya ingin mengajukan permohonan surat (mengisi data dan mengunggah dokumen pendukung), sehingga permohonan saya dapat segera diproses oleh staf.",
    "Mahasiswa, Guest"
  ],
  [
    "23.0",
    "Persuratan",
    "Unduh Template",
    "FR-REQ-02",
    "Mengunduh Template Surat",
    "Pengguna  mengunduh template surat yang sudah terisi data dari form atau template kosong",
    "Sebagai Mahasiswa / Guest, saya ingin mengunduh template surat (kosong atau terisi data), sehingga saya memiliki format permohonan yang sesuai dengan standar kampus.",
    "Mahasiswa, Guest"
  ],
  [
    "24.0",
    "Persuratan",
    "Kode Pelacakan",
    "FR-REQ-03",
    "Menerima Kode Pengajuan",
    "Sistem memberikan kode unik sebagai identitas pengajuan yang  digunakan untuk pelacakan setelah pengajuan diikirim",
    "Sebagai Mahasiswa / Guest, saya ingin mendapatkan kode unik setelah mengirim pengajuan, sehingga saya memiliki identitas untuk melacak permohonan tersebut.",
    "Mahasiswa, Guest"
  ],
  [
    "25.0",
    "Persuratan",
    "Lacak Status",
    "FR-REQ-04",
    "Melacak Status Pengajuan",
    "Melacak status di tiap alur surat yang diajukan melalui kode yang digenerate",
    "Sebagai Mahasiswa / Guest, saya ingin melacak status pengajuan menggunakan kode unik, sehingga saya selalu mengetahui sejauh mana permohonan saya diproses.",
    "Mahasiswa, Guest"
  ],
  [
    "26.0",
    "Persuratan",
    "Unduh Hasil Pengajuan",
    "FR-REQ-05",
    "Mengunduh Hasil Pengajuan",
    "Pengguna  mengunduh hasil akhir pengajuan berupa surat terbitan atau dokumen hasil lainnya.",
    "Sebagai Mahasiswa / Guest, saya ingin mengunduh hasil akhir pengajuan, sehingga saya mendapatkan dokumen surat terbitan yang saya butuhkan.",
    "Mahasiswa, Guest"
  ],
  [
    "27.0",
    "Persuratan",
    "Riwayat Pengajuan",
    "FR-REQ-06",
    "Melihat Riwayat Pengajuan",
    "Mahasiswa dapat melihat riwayat pengajuan suratnya berdasarkan NIM",
    "Sebagai Mahasiswa, saya ingin melihat riwayat pengajuan surat berdasarkan NIM, sehingga saya dapat merekap semua permohonan yang pernah saya lakukan.",
    "Mahasiswa"
  ],
  [
    "28.0",
    "Persuratan",
    "Penerimaan Pengajuan",
    "FR-PRC-01",
    "Menerima Surat Pengajuan Masuk",
    "Pegawai menerima dan melihat daftar pengajuan yang masuk ke unitnya.",
    "Sebagai Pegawai, saya ingin melihat daftar pengajuan yang masuk ke unit saya, sehingga saya bisa menindaklanjuti permohonan dari pengguna.",
    "Pegawai"
  ],
  [
    "29.0",
    "Persuratan",
    "Detail Pengajuan",
    "FR-PRC-02",
    "Melihat Detail Pengajuan",
    "Pegawai melihat informasi lengkap pengajuan termasuk data pemohon dan lampiran.",
    "Sebagai Pegawai, saya ingin melihat detail pengajuan (data pemohon dan lampiran), sehingga saya dapat memverifikasi kelengkapan permohonan tersebut.",
    "Pegawai"
  ],
  [
    "30.0",
    "Persuratan",
    "Lampiran Pengajuan",
    "FR-PRC-03",
    "Mengelola Lampiran Pengajuan",
    "Pegawai  menambahkan, memperbarui, atau memvalidasi lampiran dalam pengajuan.",
    "Sebagai Pegawai, saya ingin mengelola (menambah, memperbarui, memvalidasi) lampiran pengajuan, sehingga dokumen pendukung menjadi valid.",
    "Pegawai"
  ],
  [
    "31.0",
    "Persuratan",
    "Penerusan Bertingkat",
    "FR-PRC-04",
    "Meneruskan Surat Bertingkat",
    "Pegawai meneruskan surat pengajuan secara bertingkat kepada Pimpinan untuk direview dan dinilai validitasnya.",
    "Sebagai Pegawai, saya ingin meneruskan surat pengajuan secara bertingkat kepada Pimpinan, sehingga dokumen tersebut bisa direview otoritas yang lebih tinggi.",
    "Pegawai"
  ],
  [
    "32.0",
    "Persuratan",
    "Persetujuan Pengajuan",
    "FR-PRC-05-APPROVE",
    "Menyetujui Pengajuan",
    "Pimpinan memberikan persetujuan terhadap pengajuan surat yang diteruskan oleh Pegawai.",
    "Sebagai Pimpinan, saya ingin memberikan persetujuan terhadap pengajuan surat, sehingga proses dapat berlanjut ke tahap penerbitan.",
    "Pegawai (Pejabat / Pimpinan)"
  ],
  [
    "33.0",
    "Persuratan",
    "Pengembalian Pengajuan",
    "FR-PRC-05-REVERSE",
    "Mengembalikan Pengajuan (Backtrack)",
    "Pimpinan mengembalikan pengajuan kembali ke Pegawai jika terdapat ketidaksesuaian atau membutuhkan catatan revisi.",
    "Sebagai Pimpinan, saya ingin mengembalikan pengajuan (backtrack) ke Pegawai, sehingga ketidaksesuaian dapat diperbaiki sebelum disetujui.",
    "Pegawai (Pejabat / Pimpinan)"
  ],
  [
    "34.0",
    "Persuratan",
    "Revisi Pengajuan",
    "FR-PRC-05-REVISE",
    "Merevisi Pengajuan",
    "Pegawai menindaklanjuti status backtrack dengan melakukan perbaikan data atau meminta revisi lanjutan.",
    "Sebagai Pegawai, saya ingin merevisi pengajuan yang dikembalikan oleh Pimpinan, sehingga data permohonan menjadi benar dan siap diajukan kembali.",
    "Pegawai"
  ],
  [
    "35.0",
    "Persuratan",
    "Penyelesaian Pengajuan",
    "FR-PRC-06",
    "Menyelesaikan Pengajuan",
    "Pegawai menutup proses pengajuan dengan hasil akhir berupa surat terbitan atau status penolakan akhir.",
    "Sebagai Pegawai, saya ingin menutup/menyelesaikan proses pengajuan, sehingga permohonan mendapatkan kejelasan status akhir (diterbitkan atau ditolak).",
    "Pegawai"
  ],
  [
    "36.0",
    "Penerbitan",
    "Draf Surat Terbitan",
    "FR-REL-01",
    "Membuat Surat Terbitan",
    "Pegawai menghasilkan draft surat resmi berdasarkan pengajuan yang telah disetujui.",
    "Sebagai Pegawai, saya ingin menghasilkan draft surat resmi berdasarkan pengajuan yang telah disetujui, sehingga persiapan dokumen terbitan dapat dimulai.",
    "Pegawai"
  ],
  [
    "37.0",
    "Penerbitan",
    "Penerbitan Bertingkat",
    "FR-REL-02",
    "Mengajukan Penerbitan Bertingkat",
    "Pegawai (pemroses) mengajukan draft surat terbitan baru secara bertingkat kepada Pimpinan untuk direview.",
    "Sebagai Pegawai, saya ingin mengajukan draft penerbitan secara bertingkat kepada Pimpinan, sehingga drafttersebut dapat ditinjau sebelum disahkan.",
    "Pegawai"
  ],
  [
    "38.0",
    "Penerbitan",
    "Persetujuan Penerbitan",
    "FR-REL-03-APPROVE",
    "Menyetujui Penerbitan",
    "Pimpinan menyetujui permohonan penerbitan surat yang dikirimkan ke unit/akunnya.",
    "Sebagai Pimpinan, saya ingin menyetujui permohonan penerbitan, sehingga dokumen tersebut mendapatkan legalitas dan siap dibubuhi tanda tangan.",
    "Pegawai"
  ],
  [
    "39.0",
    "Penerbitan",
    "Pengembalian Penerbitan",
    "FR-REL-03-REVERSE",
    "Mengembalikan Penerbitan (Backtrack)",
    "Pimpinan mengembalikan draft penerbitan surat ke unit pemohon/pemroses jika terdapat kesalahan.",
    "Sebagai Pimpinan, saya ingin mengembalikan draft penerbitan (backtrack), sehingga Pegawai dapat memperbaiki kesalahan redaksional yang ada.",
    "Pegawai"
  ],
  [
    "40.0",
    "Penerbitan",
    "Revisi Penerbitan",
    "FR-REL-04-REVISE",
    "Merevisi Draft Penerbitan",
    "Pegawai melakukan revisi terhadap draft penerbitan surat yang ditolak/dikembalikan oleh pimpinan.",
    "Sebagai Pegawai, saya ingin merevisi draft penerbitan yang ditolak, sehingga saya bisa memperbaiki dokumen sesuai catatan dari Pimpinan.",
    "Pegawai"
  ],
  [
    "41.0",
    "Penerbitan",
    "Tanda Tangan Digital",
    "FR-TTD-01-TD",
    "Tanda Tangan Digital",
    "User dapat menambahkan tanda tangan digital pada dokumen",
    "Sebagai Pimpinan / Sistem, saya ingin menempelkan tanda tangan digital pada dokumen, sehingga surat terbitan memiliki keabsahan hukum secara elektronik.",
    "Pegawai (Pejabat / Pimpinan)"
  ],
  [
    "42.0",
    "Penerbitan",
    "Embedding QR Code",
    "FR-TTD-01-QR",
    "Embedding QR Code",
    "User dapat menyematkan QR Code pada dokumen final surat terbitan untuk validasi orisinalitas dokumen.",
    "Sebagai Sistem, saya ingin menyematkan QR Code pada dokumen final, sehingga orisinalitas surat terbitan dapat dilacak dan diverifikasi oleh pihak luar.",
    "Pegawai (Pejabat / Pimpinan)"
  ],
  [
    "43.0",
    "Penerbitan",
    "Pengiriman Terbitan",
    "FR-REL-05-SEND",
    "Mengirimkan Surat Terbitan",
    "Pegawai mengirimkan hasil terbitan surat final ke pemohon awal",
    "Sebagai Pegawai, saya ingin mengirimkan hasil terbitan final ke pemohon awal, sehingga siklus pelayanan persuratan selesai.",
    "Pegawai"
  ],
  [
    "44.0",
    "Penerbitan",
    "Pengarsipan Terbitan",
    "FR-REL-06-ARCHIVE",
    "Mengarsipkan Surat Terbitan",
    "User dapat menyimpan arsip surat terbitan di unitnya",
    "Sebagai Pegawai, saya ingin menyimpan arsip surat terbitan di sistem, sehingga dokumen tersebut terdokumentasi dengan baik di unit saya.",
    "Pegawai"
  ],
  [
    "45.0",
    "Pengelolaan No",
    "Penomoran Otomatis",
    "FR-NBR-01",
    "Mengelola Nomor Surat",
    "Mengelola format nomor surat yang digunakan",
    "Sebagai Pegawai, saya ingin mengelola format nomor surat, sehingga penomoran dokumen di unit saya tetap rapi dan sesuai standar.",
    "Pegawai, Admin"
  ],
  [
    "46.0",
    "Pengelolaan No",
    "Penomoran Backdate",
    "FR-NBR-02",
    "Mengatur Nomor Backdate",
    "Pegawai  menetapkan nomor surat dengan tanggal mundur sesuai kebutuhan administratif.",
    "Sebagai Pegawai, saya ingin menetapkan nomor surat dengan tanggal mundur (backdate), sehingga kebutuhan administratif mendesak tetap tertangani.",
    "Pegawai"
  ],
  [
    "47.0",
    "Pengarsipan",
    "Arsipkan Surat",
    "FR-ARC-01",
    "Mengarsipkan Surat",
    "Unit mengarsipkan surat berdasarkan jenisnya (NDE, Pengajuan, Penerbitan) untuk setiap unitnya",
    "Sebagai Pegawai, saya ingin mengarsipkan surat berdasarkan jenisnya (NDE, Pengajuan, Penerbitan), sehingga dokumen digital terklasifikasi dengan baik dan terorganisir dengan baik.",
    "Pegawai"
  ],
  [
    "48.0",
    "Pengarsipan",
    "Daftar Arsip Surat",
    "FR-ARC-02",
    "Melihat Arsip Surat",
    "Pegawai  melihat daftar surat yang telah diarsipkan di unitnya.",
    "Sebagai Pegawai, saya ingin melihat daftar arsip surat, sehingga saya dapat meninjau seluruh riwayat persuratan yang pernah ada di unit saya.",
    "Pegawai"
  ],
  [
    "49.0",
    "Pengarsipan",
    "Pencarian Arsip",
    "FR-ARC-03",
    "Mencari Arsip",
    "Pegawai  mencari arsip surat berdasarkan perihal, pengirim, atau kategori arsip.",
    "Sebagai Pegawai, saya ingin mencari arsip berdasarkan perihal, pengirim, atau kategori, sehingga pencarian dokumen lampau dapat dilakukan dalam hitungan detik.",
    "Pegawai"
  ],
  [
    "50.0",
    "Pengarsipan",
    "Kategori Arsip",
    "FR-ARC-04",
    "Mengelola Kategori Arsip",
    "Pegawai  membuat, mengubah, dan menghapus kategori arsip surat.",
    "Sebagai Pegawai, saya ingin mengelola kategori arsip, sehingga saya bisa menyesuaikan folder penyimpanan dengan kebutuhan spesifik unit.",
    "Pegawai"
  ],
  [
    "51.0",
    "Notifikasi",
    "Notifikasi Web",
    "FR-NOTIF-01",
    "Menerima Notifikasi Web Terkait Surat Masuk",
    "Sistem memberikan notifikasi melalui web saat terdapat surat masuk.",
    "Sebagai Pegawai, saya ingin menerima notifikasi aplikasi (web) saat ada surat masuk, sehingga saya bisa langsung meresponsnya ketika sedang bekerja di depan layar.",
    "Pegawai"
  ],
  [
    "52.0",
    "Notifikasi",
    "Notifikasi WhatsApp",
    "FR-NOTIF-02",
    "Menerima Notifikasi WhatsApp Terkait Surat Masuk",
    "Sistem mengirimkan notifikasi melalui WhatsApp saat terdapat surat masuk.",
    "Sebagai Pegawai, saya ingin menerima notifikasi via WhatsApp, sehingga saya tidak melewatkan informasi surat penting meskipun sedang tidak membuka aplikasi SIMAS.",
    "Pegawai"
  ]
];

  sheetRefined.getRange(2, 1, refinedData.length, 8).setValues(refinedData);
  Logger.log("Berhasil memperbarui 52 baris pada sheet 'Requirement Refined'");

  // 2. UPDATE TAB 'Usecase RTM' jika ada
  if (sheetRTM) {
    // Sisipkan FR-ADM-06 pada urutan No 7 jika belum ada, atau perbarui data dasar kolom A s/d D
    const rtmBaseData = refinedData.map(r => [r[0], r[1], r[2], r[3], r[4]]);
    // Perbarui kolom No, Modul, Sub-Modul, Kode FR, Nama FR dari baris 3 sampai 54
    sheetRTM.getRange(3, 1, rtmBaseData.length, 5).setValues(rtmBaseData);
    Logger.log("Berhasil memperbarui penomoran & kode FR 1 s/d 52 pada sheet 'Usecase RTM'");
  }

  Logger.log("SINKRONISASI REQUIREMENT SELESAI DENGAN SUKSES 100%!");
}
