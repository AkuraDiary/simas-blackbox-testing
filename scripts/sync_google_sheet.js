/**
 * Script Sinkronisasi Otomatis Dokumen Test Case & Test Case Analysis SIMAS
 * Cara Penggunaan:
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1565c4qhdnLO3XK_uuM7VWCUN86_H29-WeGCuDKt2nDM/edit
 * 2. Klik menu Extensions (Ekstensi) > Apps Script
 * 3. Hapus kode default (jika ada), paste seluruh isi file ini
 * 4. Klik tombol "Run" (Jalankan) dengan fungsi terpilih: syncSpreadsheet
 * 5. Berikan izin saat pertama kali dijalankan. Selesai!
 */

function syncSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTC = ss.getSheetByName("Test Cases");
  const sheetAnalysis = ss.getSheetByName("Test Case Analysis");

  if (!sheetTC) {
    throw new Error("Sheet 'Test Cases' tidak ditemukan!");
  }
  if (!sheetAnalysis) {
    throw new Error("Sheet 'Test Case Analysis' tidak ditemukan!");
  }

  Logger.log("Memulai sinkronisasi...");

  // =========================================================================
  // 1. UPDATE TAB 'Test Cases'
  // =========================================================================

  // A. Isi Baris 83 & 84 (No 77 & 78) - FR-REQ-03
  const tcRows77_78 = [
    [
      "77", "FR-REQ-03", "TC-FR-REQ-03",
      "Sistem menerbitkan kode pelacakan unik setelah permohonan berhasil dikirim",
      "Formulir pengajuan surat layanan terkirim",
      "1. Lakukan pengiriman formulir permohonan surat hingga tuntas\n2. Amati tampilan kartu konfirmasi pada layar sukses",
      "Formulir pengajuan surat layanan terkirim",
      "Sistem menampilkan kode unik pelacakan (format: REQ-XXXXXXXXXXXX) dan menyediakan tombol salin kode tracking",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    [
      "78", "", "TC-ALT-FR-REQ-03",
      "Sistem menahan penerbitan kode pelacakan jika formulir belum valid",
      "Halaman formulir pengajuan surat publik terbuka",
      "1. Biarkan field wajib kosong pada formulir pengajuan\n2. Klik tombol Kirim / Lanjutkan",
      "Formulir dengan field wajib tidak lengkap",
      "Sistem menahan pengiriman, kode pelacakan tidak diterbitkan, dan menampilkan pesan validasi error",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ]
  ];
  sheetTC.getRange(83, 1, 2, 13).setValues(tcRows77_78);
  Logger.log("Berhasil mengisi baris 83-84 (FR-REQ-03)");

  // B. Isi Baris 94 s/d 112 (No 88 s/d 106) - FR-PRC-01 s/d FR-REL-02
  const tcRows88_106 = [
    // 88
    [
      "88", "", "TC-ALT-FR-PRC-01",
      "Pencarian antrean surat pengajuan dengan kata kunci fiktif menampilkan status kosong",
      "Staf Unit login dan membuka menu Surat Masuk tab Pengajuan",
      "1. Ketik kata kunci acak fiktif pada kotak pencarian antrean pengajuan\n2. Tekan Enter atau tunggu filter otomatis",
      "Keyword: \"DataPengajuanFiktif999XYZ\"",
      "Tabel pengajuan menyaring baris dan menampilkan pesan status data kosong tanpa error aplikasi",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 89
    [
      "89", "FR-PRC-02", "TC-FR-PRC-02",
      "Staf Unit membuka dan memeriksa lembar detail surat pengajuan masuk",
      "Terdapat surat pengajuan masuk di antrean unit",
      "1. Klik tombol aksi detail (ikon mata / record URL) pada baris pengajuan\n2. Periksa panel data pemohon dan riwayat alur pengajuan",
      "ID Pengajuan valid",
      "Halaman detail pengajuan terbuka menampilkan data pemohon lengkap, alasan pengajuan, dan timeline alur surat",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 90
    [
      "90", "", "TC-ALT-FR-PRC-02",
      "Akses langsung detail pengajuan dengan ID fiktif menampilkan penanganan not found",
      "Staf Unit login pada sistem SIMAS",
      "1. Akses langsung URL detail pengajuan dengan ID fiktif non-existent di browser (/admin/surats/99999999)\n2. Amati respon halaman",
      "ID Pengajuan: 99999999",
      "Sistem merespon dengan halaman HTTP 404 Not Found yang terisolasi dengan aman",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 91
    [
      "91", "FR-PRC-03", "TC-FR-PRC-03",
      "Staf Unit memeriksa dan mengunduh berkas lampiran pendukung pengajuan",
      "Surat pengajuan memuat berkas lampiran pendukung",
      "1. Pada halaman detail pengajuan, buka tab atau daftar Lampiran\n2. Klik tautan berkas lampiran untuk mengunduh atau melihat pratinjau",
      "Berkas lampiran valid",
      "Berkas lampiran dapat dibuka dan diunduh ke perangkat pengguna secara utuh",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 92
    [
      "92", "", "TC-ALT-FR-PRC-03",
      "Pemeriksaan detail pengajuan tanpa lampiran menampilkan penanda kosong informatif",
      "Surat pengajuan diajukan tanpa mengunggah berkas lampiran opsional",
      "1. Buka detail surat pengajuan tanpa lampiran\n2. Amati bagian daftar berkas lampiran",
      "Pengajuan tanpa file lampiran",
      "Sistem menampilkan keterangan 'Tidak ada lampiran' tanpa error atau tombol rusak",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 93
    [
      "93", "FR-PRC-04", "TC-FR-PRC-04",
      "Staf Unit meneruskan surat pengajuan secara bertingkat ke pimpinan unit",
      "Surat pengajuan berstatus MENUNGGU dan ditujukan ke unit kerja aktif",
      "1. Buka detail pengajuan\n2. Klik tombol aksi 'Proses Surat'\n3. Pilih 'Teruskan Saja (Tanpa Setuju)'\n4. Pilih unit peninjau dan masukkan catatan pengantar\n5. Klik Konfirmasi Kirim",
      "Unit Peninjau valid, Catatan pengantar terisi",
      "Surat permohonan berhasil diteruskan, berpindah ke antrean pimpinan dengan status MENUNGGU PERSETUJUAN",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 94
    [
      "94", "", "TC-ALT-FR-PRC-04",
      "Validasi form penolakan saat unit tujuan penerusan dikosongkan",
      "Modal aksi penerusan surat terbuka",
      "1. Buka modal Teruskan Surat\n2. Kosongkan pilihan unit peninjau tujuan\n3. Klik tombol konfirmasi kirim",
      "Unit tujuan: [Kosong]",
      "Sistem menolak submit dan memunculkan pesan validasi error bahwa unit tujuan wajib dipilih",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 95
    [
      "95", "FR-PRC-05-APPROVE", "TC-FR-PRC-05-APPROVE",
      "Pimpinan Unit menyetujui permohonan pengajuan surat yang masuk",
      "Pimpinan login dan surat berada pada antrean persetujuan unit",
      "1. Buka detail pengajuan masuk pada akun Pimpinan\n2. Buka dropdown 'Proses Surat'\n3. Pilih aksi persetujuan ('Setujui')\n4. Masukkan catatan persetujuan dan konfirmasi",
      "Catatan persetujuan terisi",
      "Status pengajuan berubah menjadi DISETUJUI dan siap diproses ke tahap pembuatan surat terbitan",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 96
    [
      "96", "", "TC-ALT-FR-PRC-05-APPROVE",
      "Aksi persetujuan dinonaktifkan atau ditolak bagi pengguna di luar kewenangan alur",
      "Akun login bukan penerima target dari langkah riwayat aktif",
      "1. Buka detail surat pengajuan yang ditujukan ke unit lain\n2. Amati ketersediaan tombol 'Proses Surat'",
      "Akun di luar wewenang unit tujuan",
      "Tombol aksi persetujuan 'Proses Surat' tidak ditampilkan oleh sistem",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 97
    [
      "97", "FR-PRC-05-REVERSE", "TC-FR-PRC-05-REVERSE",
      "Pimpinan Unit mengembalikan surat pengajuan ke unit peninjau sebelumnya (backtrack)",
      "Surat berada pada tahapan review bertingkat",
      "1. Buka detail pengajuan pada menu Surat Masuk\n2. Buka dropdown aksi 'Kembalikan / Tolak'\n3. Pilih 'Kembalikan ke Langkah Sebelumnya'\n4. Masukkan alasan koreksi dan konfirmasi",
      "Catatan alasan: \"Data lampiran belum lengkap\"",
      "Surat dikembalikan ke antrean unit sebelumnya dengan status REVISI dan catatan terekam pada riwayat alur",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 98
    [
      "98", "", "TC-ALT-FR-PRC-05-REVERSE",
      "Validasi form saat alasan pengembalian pengajuan dikosongkan",
      "Modal aksi pengembalian surat terbuka",
      "1. Buka modal Kembalikan Surat\n2. Kosongkan field catatan alasan pengembalian\n3. Klik tombol konfirmasi",
      "Catatan alasan: [Kosong]",
      "Sistem menahan pengembalian dan mewajibkan pengisian alasan pengembalian",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 99
    [
      "99", "FR-PRC-05-REVISE", "TC-FR-PRC-05-REVISE",
      "Staf Unit mengembalikan draf permohonan ke pemohon awal untuk perbaikan berkas",
      "Surat pengajuan berstatus perlu verifikasi di unit kerja",
      "1. Buka detail surat pengajuan masuk\n2. Buka dropdown 'Kembalikan / Tolak'\n3. Pilih 'Kembalikan ke Pembuat Awal (Reset)'\n4. Tulis instruksi perbaikan dan konfirmasi",
      "Catatan: \"KTM buram, mohon unggah ulang\"",
      "Status pengajuan berubah menjadi PERLU PERBAIKAN dan catatan perbaikan dapat dilihat oleh pemohon",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 100
    [
      "100", "", "TC-ALT-FR-PRC-05-REVISE",
      "Validasi form penolakan saat instruksi reset revisi dikosongkan",
      "Modal reset pengajuan ke pemohon awal terbuka",
      "1. Buka modal kembalikan ke pembuat awal\n2. Kosongkan field alasan/catatan perbaikan\n3. Klik tombol konfirmasi",
      "Alasan perbaikan: [Kosong]",
      "Sistem menahan submit dan memunculkan pesan validasi error bahwa alasan wajib diisi",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 101
    [
      "101", "FR-PRC-06", "TC-FR-PRC-06",
      "Staf Unit menyelesaikan alur pemrosesan pengajuan setelah layanan tuntas",
      "Pengajuan telah disetujui pimpinan atau selesai ditindaklanjuti",
      "1. Buka detail pengajuan yang telah tuntas\n2. Klik tombol aksi 'Tandai Selesai' / 'Selesaikan Pengajuan'\n3. Konfirmasi penyelesaian",
      "Pengajuan valid tuntas diproses",
      "Status pengajuan berubah menjadi SELESAI dan seluruh alur siklus permohonan tuntas",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 102
    [
      "102", "", "TC-ALT-FR-PRC-06",
      "Sistem mencegah penyelesaian pengajuan yang masih berstatus menunggu revisi",
      "Surat pengajuan berstatus REVISI / PERLU PERBAIKAN",
      "1. Buka detail pengajuan yang berstatus REVISI\n2. Amati ketersediaan tombol selesaikan pengajuan",
      "Pengajuan berstatus REVISI",
      "Tombol untuk menyelesaikan surat tidak aktif atau sistem menolak penyelesaian sebelum permohonan disetujui",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 103
    [
      "103", "FR-REL-01", "TC-FR-REL-01",
      "Staf Unit membuat draf surat terbitan balasan dari pengajuan yang telah disetujui",
      "Surat pengajuan berstatus disetujui pimpinan",
      "1. Buka detail pengajuan yang telah disetujui\n2. Klik tombol aksi 'Terbitkan Surat Balasan'\n3. Pilih template terbitan atau buat draf dari awal\n4. Isi perihal dan naskah surat lalu simpan",
      "Template terbitan valid, Perihal balasan terisi",
      "Surat terbitan baru berhasil dibuat dengan status DRAFT dan terhubung dengan surat rujukan pengajuan",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 104
    [
      "104", "", "TC-ALT-FR-REL-01",
      "Validasi submit draf terbitan saat field perihal dikosongkan",
      "Form draf surat terbitan balasan terbuka",
      "1. Buka form pembuatan terbitan balasan\n2. Kosongkan field perihal surat\n3. Klik tombol 'Simpan Draft'",
      "Perihal: [Kosong]",
      "Sistem menolak penyimpanan draf dan memunculkan notifikasi validasi bahwa perihal wajib diisi",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 105
    [
      "105", "FR-REL-02", "TC-FR-REL-02",
      "Staf Unit mengajukan draf surat terbitan secara berjenjang ke pimpinan unit",
      "Draf surat terbitan berstatus DRAFT telah selesai disusun",
      "1. Buka draf surat terbitan\n2. Klik tombol aksi 'Kirim / Pengajuan'\n3. Tentukan alur peninjau bertingkat dan masukkan catatan pengantar\n4. Klik Konfirmasi Kirim",
      "Alur peninjau bertingkat dipilih, Catatan pengantar terisi",
      "Status surat terbitan berubah menjadi DIPROSES (Menunggu Persetujuan) dan masuk ke daftar kerja surat pimpinan",
      "BBT", "Positive", "Seta & ayang", "Berhasil", "Automated"
    ],
    // 106
    [
      "106", "", "TC-ALT-FR-REL-02",
      "Validasi pengajuan terbitan saat belum ada unit peninjau yang dipilih",
      "Modal alur pengajuan draf surat terbitan terbuka",
      "1. Klik tombol Kirim / Pengajuan pada draf terbitan\n2. Kosongkan daftar alur peninjau pimpinan\n3. Klik tombol Konfirmasi Kirim",
      "Alur peninjau: [Kosong]",
      "Sistem menolak pengiriman dan mewajibkan pemilihan minimal satu unit peninjau pimpinan",
      "BBT", "Negative", "Seta & ayang", "Berhasil", "Automated"
    ]
  ];
  sheetTC.getRange(94, 1, 19, 13).setValues(tcRows88_106);
  Logger.log("Berhasil mengisi baris 94-112 (FR-PRC-01 s/d FR-REL-02)");

  // C. Penyelarasan FR TTD Digital di Baris 119 & 120 (No 113 & 114)
  sheetTC.getRange(119, 2).setValue("FR-TTD-01-TD");
  sheetTC.getRange(120, 2).setValue("FR-TTD-01-QR");
  Logger.log("Berhasil menyelaraskan kode FR TTD (FR-TTD-01-TD & FR-TTD-01-QR)");

  // D. Seragamkan Kolom M (Cypress status) dari baris 7 s/d 141 menjadi 'Automated'
  const totalRows = 141 - 7 + 1;
  const statusValues = Array(totalRows).fill(["Automated"]);
  sheetTC.getRange(7, 13, totalRows, 1).setValues(statusValues);
  Logger.log("Berhasil menyelaraskan Cypress status menjadi 'Automated'");

  // =========================================================================
  // 2. UPDATE TAB 'Test Case Analysis'
  // =========================================================================

  // A. Bersihkan redundansi blok legacy FR-REQ-02 di baris 158-170
  // Tandai sebagai DEPRECATED (Moved to FR-REQ-01) agar history tetap rapi
  sheetAnalysis.getRange(158, 2).setValue("FR-REQ-02 [DEPRECATED - Sub-form Validation of FR-REQ-01]");
  Logger.log("Berhasil menandai blok legacy FR-REQ-02 di baris 158");

  // B. Tambahkan 8 blok analisis baru mulai baris 602
  const analysisBlocks = [
    // 1. FR-REQ-03
    ["Analysis for ", "FR-REQ-03 (Menerima Kode Pengajuan)", "", ""],
    ["ID : ", "FR-REQ-03 - DATA", "", ""],
    ["Method :", "Use Case Testing & Equivalence Partitioning", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Sistem menerbitkan kode unik pelacakan setelah permohonan berhasil terkirim", "Formulir pengajuan surat layanan terisi valid & terkirim", "Sistem menampilkan kode unik pelacakan berformat REQ-XXXXXXXXXXXX dan menyediakan tombol salin kode", "TC-FR-REQ-03"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Sistem menahan penerbitan kode pelacakan jika formulir belum valid", "Formulir dengan field wajib kosong / submit gagal", "Sistem tidak menerbitkan kode pelacakan dan menampilkan pesan validasi error", "TC-ALT-FR-REQ-03"],
    ["", "", "", ""],

    // 2. FR-PRC-03
    ["Analysis for ", "FR-PRC-03 (Mengelola Lampiran Pengajuan)", "", ""],
    ["ID : ", "FR-PRC-03 - DATA", "", ""],
    ["Method :", "Equivalence Partitioning & Use Case Testing", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Staf Unit memeriksa dan mengunduh berkas lampiran pendukung pengajuan", "Berkas lampiran format PDF/JPG valid", "Berkas lampiran dapat dibuka, dipratinjau, dan diunduh ke perangkat pengguna", "TC-FR-PRC-03"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Pemeriksaan detail pengajuan tanpa berkas lampiran pendukung", "Pengajuan tanpa file lampiran pendukung", "Sistem menampilkan keterangan 'Tidak ada lampiran' tanpa memunculkan error atau tautan rusak", "TC-ALT-FR-PRC-03"],
    ["", "", "", ""],

    // 3. FR-PRC-04
    ["Analysis for ", "FR-PRC-04 (Meneruskan Surat Bertingkat)", "", ""],
    ["ID : ", "FR-PRC-04 - DATA", "", ""],
    ["Method :", "Equivalence Partitioning & Use Case Testing", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Staf Unit meneruskan surat pengajuan secara bertingkat ke pimpinan unit", "Unit Peninjau valid, Catatan pengantar terisi", "Surat permohonan berpindah ke antrean pimpinan dengan status MENUNGGU PERSETUJUAN", "TC-FR-PRC-04"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Validasi penolakan saat unit tujuan penerusan dikosongkan", "Unit peninjau tujuan: [Kosong]", "Sistem menolak submit dan memunculkan notifikasi validasi error bahwa unit tujuan wajib dipilih", "TC-ALT-FR-PRC-04"],
    ["", "", "", ""],

    // 4. FR-PRC-05-APPROVE
    ["Analysis for ", "FR-PRC-05-APPROVE (Menyetujui Pengajuan)", "", ""],
    ["ID : ", "FR-PRC-05-APPROVE - DATA", "", ""],
    ["Method :", "Use Case Testing & Equivalence Partitioning", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Pimpinan Unit menyetujui permohonan pengajuan surat yang masuk", "Keputusan: DISETUJUI, Catatan persetujuan valid", "Status pengajuan berubah menjadi DISETUJUI dan siap diproses ke tahap pembuatan surat terbitan", "TC-FR-PRC-05-APPROVE"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Aksi persetujuan dinonaktifkan untuk pengguna di luar kewenangan alur", "Akun login di luar unit kerja penerima", "Tombol aksi persetujuan 'Proses Surat' tidak ditampilkan oleh sistem", "TC-ALT-FR-PRC-05-APPROVE"],
    ["", "", "", ""],

    // 5. FR-PRC-05-REVERSE
    ["Analysis for ", "FR-PRC-05-REVERSE (Mengembalikan Pengajuan)", "", ""],
    ["ID : ", "FR-PRC-05-REVERSE - DATA", "", ""],
    ["Method :", "Use Case Testing & Boundary Value Analysis", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Pimpinan Unit mengembalikan surat pengajuan ke unit peninjau sebelumnya (backtrack)", "Catatan alasan: 'Data pendukung belum lengkap dari unit pengusul'", "Surat dikembalikan ke antrean unit sebelumnya dengan status REVISI dan catatan terekam", "TC-FR-PRC-05-REVERSE"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Validasi form saat alasan pengembalian pengajuan dikosongkan", "Catatan alasan pengembalian: [Kosong]", "Sistem menahan pengembalian dan mewajibkan pengisian alasan pengembalian", "TC-ALT-FR-PRC-05-REVERSE"],
    ["", "", "", ""],

    // 6. FR-PRC-05-REVISE
    ["Analysis for ", "FR-PRC-05-REVISE (Merevisi Pengajuan)", "", ""],
    ["ID : ", "FR-PRC-05-REVISE - DATA", "", ""],
    ["Method :", "Use Case Testing & Equivalence Partitioning", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Staf Unit mengembalikan draf permohonan ke pemohon awal untuk perbaikan berkas", "Catatan revisi: 'KTM buram, mohon unggah ulang berkas baru'", "Status pengajuan berubah menjadi PERLU PERBAIKAN dan catatan perbaikan dapat dilihat pemohon", "TC-FR-PRC-05-REVISE"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Validasi form penolakan saat instruksi reset revisi dikosongkan", "Catatan perbaikan pemohon: [Kosong]", "Sistem menahan submit dan memunculkan pesan validasi error bahwa alasan wajib diisi", "TC-ALT-FR-PRC-05-REVISE"],
    ["", "", "", ""],

    // 7. FR-PRC-06
    ["Analysis for ", "FR-PRC-06 (Menyelesaikan Pengajuan)", "", ""],
    ["ID : ", "FR-PRC-06 - DATA", "", ""],
    ["Method :", "Use Case Testing & Equivalence Partitioning", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Staf Unit menyelesaikan alur pemrosesan pengajuan setelah layanan tuntas", "Pengajuan telah tuntas diproses / disetujui", "Status pengajuan berubah menjadi SELESAI dan seluruh siklus alur pengajuan selesai", "TC-FR-PRC-06"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Sistem mencegah penyelesaian pengajuan yang masih berstatus menunggu revisi", "Pengajuan berstatus REVISI / PERLU PERBAIKAN", "Tombol selesaikan surat tidak aktif atau sistem menolak penyelesaian sebelum surat disetujui", "TC-ALT-FR-PRC-06"],
    ["", "", "", ""],

    // 8. FR-REL-01
    ["Analysis for ", "FR-REL-01 (Membuat Surat Terbitan)", "", ""],
    ["ID : ", "FR-REL-01 - DATA", "", ""],
    ["Method :", "Equivalence Partitioning & Use Case Testing", "", ""],
    ["Valid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Staf Unit membuat draf surat terbitan balasan dari pengajuan yang telah disetujui", "Surat rujukan berstatus disetujui, Perihal & naskah balasan valid", "Surat terbitan baru berhasil dibuat dengan status DRAFT dan terhubung dengan surat rujukan", "TC-FR-REL-01"],
    ["", "", "", ""],
    ["Invalid Scenario", "", "", ""],
    ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
    ["Validasi submit draf terbitan saat field perihal dikosongkan", "Perihal surat terbitan: [Kosong]", "Sistem menolak penyimpanan draf dan memunculkan notifikasi validasi bahwa perihal wajib diisi", "TC-ALT-FR-REL-01"],
    ["", "", "", ""]
  ];

  sheetAnalysis.getRange(602, 1, analysisBlocks.length, 4).setValues(analysisBlocks);
  Logger.log("Berhasil menambahkan 8 blok analisis baru ke baris 602 tab Test Case Analysis");

  Logger.log("SINKRONISASI SUKSES 100%!");
}
