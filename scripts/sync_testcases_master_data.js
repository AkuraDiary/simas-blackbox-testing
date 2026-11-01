/**
 * Script Google Apps Script: Sinkronisasi Data Uji Master Data UNIK
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1565c4qhdnLO3XK_uuM7VWCUN86_H29-WeGCuDKt2nDM/edit
 * 
 * Petunjuk Eksekusi:
 * 1. Buka spreadsheet Test Cases di browser
 * 2. Klik Extensions (Ekstensi) > Apps Script
 * 3. Buat file baru atau ganti isi file yang ada dengan script ini
 * 4. Pilih fungsi `syncMasterDataTestCases` lalu klik tombol Run (Jalankan)
 * 5. Berikan izin saat pertama kali dijalankan
 */

function syncMasterDataTestCases() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTC = ss.getSheetByName("Test Cases");
  const sheetAnalysis = ss.getSheetByName("Test Case Analysis");

  if (!sheetTC) throw new Error("Sheet 'Test Cases' tidak ditemukan!");
  if (!sheetAnalysis) throw new Error("Sheet 'Test Case Analysis' tidak ditemukan!");

  Logger.log("=== Memulai Sinkronisasi Nilai Data Uji Master Data UNIK ===");

  // 1. Pemetaan Penggantian Nilai Data Uji Spesifik pada Tab 'Test Cases' (Kolom G / Index 7)
  // Format: [No Baris Spreadsheet, Nilai Baru TEST INPUT DATA]
  const tcDataUpdates = [
    // Autentikasi & Akun Pegawai
    [7, "Username: \"admin\", Password: \"password\""],
    [8, "Username: \"admin\", Password: \"wrongpassword123\""],
    [9, "Username: [Kosong], Password: [Kosong]"],
    [10, "Sesi login aktif akun \"rektor\""],
    
    // Manajemen Organisasi & Pengguna
    [11, "Nama Unit: \"Direktorat Inovasi dan Sistem Informasi\", Singkatan: \"DISI\", Jenis: \"Direktorat\""],
    [12, "Field form unit dikosongkan"],
    [13, "Nama Unit baru: \"Direktorat Inovasi & Sistem Informasi (DISI)\", Singkatan: \"DISI-UPB\""],
    [14, "Nama unit: [Kosong]"],
    [15, "Jabatan baru: \"Kepala\", Level: \"1\""],
    [16, "Unit induk berelasi anak: \"Rektorat\""],
    [17, "Unit sasaran: \"Direktorat Inovasi & Sistem Informasi (DISI)\""],
    
    // Format Nomor Surat
    [26, "Kode: \"BAKU\", Format: \"{NOMOR}/BAKU/{BULAN_ROMAWI}/{TAHUN}\", Unit: \"Biro Administrasi Keuangan dan Umum (BAKU)\""],
    [27, "Field wajib format penomoran dikosongkan"],
    [28, "Format baru: \"{NOMOR}/BAKU-REV/{BULAN_ROMAWI}/{TAHUN}\""],
    [29, "Kode format nomor: \"BAKU\""],
    
    // Template Naskah Dinas Resmi UNIK
    [30, "Nama Template: \"Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional\", Kategori: \"Surat Tugas / Edaran\", File: \"template_sterilisasi_unik.docx\""],
    [31, "Field wajib nama template dikosongkan"],
    [32, "Nama template baru: \"Surat Tugas Sterilisasi Ruang Laboratorium UNIK\""],
    [33, "Template sasaran: \"Surat Tugas Sterilisasi Ruang Laboratorium UNIK\""],
    
    // Naskah Dinas Elektronik (Draft Surat)
    [34, "Metode: Scratch, Perihal: \"Surat Koordinasi Persiapan Akreditasi FIK UNIK\", Unit Tujuan: \"Biro Administrasi Akademik dan Kemahasiswaan (BAAK)\""],
    [35, "Perihal: [Kosong]"],
    [36, "Template: \"Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional\", Variabel: { rujukan_permohonan: \"012/FIK/UNIK/X/2026\", nama_kegiatan: \"Sterilisasi Lab Farmasi\", ruang_terdampak: \"Lab Farmasi Lt 2\", jadwal_sterilisasi: \"Senin, 02 November 2026\" }"],
    [37, "Template valid, field variabel wajib dikosongkan"],
    [38, "Perihal naskah diubah menjadi: \"Surat Koordinasi Persiapan Akreditasi FIK UNIK [Revisi Redaksi]\""],
    [39, "Perihal naskah dikosongkan saat pengeditan"],
    
    // Pengiriman & Persetujuan (NDE)
    [43, "Metode: Scratch, Perihal: \"Surat Permohonan Fasilitasi Ruang Ujian FIK\", Unit Tujuan: \"Biro Administrasi Keuangan dan Umum (BAKU)\", Catatan: \"Mohon ditindaklanjuti untuk persiapan ruang ujian\""],
    [44, "Unit tujuan: [Kosong], Jalur persetujuan: [Kosong]"],
    [45, "Perihal: \"Draf Keputusan Bersama Penetapan Kurikulum FIK\", Alur Khusus: [Jabatan: Dekan Fakultas Ilmu Kesehatan, Penandatangan: Ya], Catatan: \"Diajukan untuk review dan persetujuan Dekan\""],
    [46, "Catatan alasan pengembalian dikosongkan"],
    [47, "Alasan pengembalian: \"Terdapat rujukan regulasi yang perlu diperbarui pada paragraf pertimbangan\""],
    [48, "Alasan revisi total: \"Format dan konsiderans keputusan wajib diselaraskan dengan Statuta UNIK 2026\""],
    [49, "Alasan penolakan permanen: \"Program kerja tidak dialokasikan pada RKAT tahun anggaran berjalan\""],
    
    // Tanda Tangan Elektronik & Verifikasi
    [50, "Metode: Generate QR Code, Posisi: Halaman 1, Nama & Jabatan: Aktif"],
    [51, "Metode TTE: [Tidak Dipilih]"],
    [52, "QR Code valid pada dokumen surat resmi terbitan"],
    [53, "Token QR fiktif / tidak terdaftar: \"INVALID-TOKEN-99999\""],
    
    // Disposisi Surat
    [54, "Surat Masuk sasaran, Penerima Disposisi: \"Fakultas Ilmu Kesehatan (FIK)\", Instruksi: \"Tindak Lanjuti Segera\", Catatan: \"Mohon siapkan laporan evaluasi\""],
    [55, "Penerima disposisi: [Kosong]"],
    [56, "Tanggapan disposisi: \"Laporan tindak lanjut telah disusun dan diserahkan ke BAKU\""],
    [57, "Teks tanggapan disposisi: [Kosong]"],
    
    // Siklus Pengajuan & Terbitan Balasan
    [89, "ID Pengajuan valid dari portal mahasiswa/publik"],
    [93, "Unit Peninjau: \"Fakultas Ilmu Kesehatan (FIK)\", Catatan: \"Mohon verifikasi berkas permohonan mahasiswa\""],
    [95, "Catatan persetujuan: \"Permohonan telah diverifikasi dan disetujui sesuai persyaratan akademik\""],
    [97, "Catatan alasan: \"Berkas transkrip nilai belum dilegalisir unit asal\""],
    [99, "Catatan revisi: \"KTM buram, mohon unggah ulang berkas scan asli berwarna\""],
    [101, "Catatan finalisasi: \"Layanan permohonan legalisir selesai diproses dan berkas diserahkan\""],
    [103, "Pengajuan rujukan valid, Perihal: \"Surat Keterangan Pengantar Izin Penelitian Mahasiswa\", Template: Scratch"],
    [105, "Catatan pengantar: \"Mohon persetujuan draf surat pengantar izin penelitian\""],
    [107, "Catatan persetujuan: \"Draf surat balasan disetujui untuk penomoran resmi BAKU\""],
    [109, "Catatan koreksi: \"Perbaiki penulisan nama instansi lokasi penelitian mahasiswa\""],
    [111, "Perihal terbitan: \"Surat Keterangan Pengantar Izin Penelitian Mahasiswa [Revisi Disetujui]\""],
    [115, "Format penomoran: \"{NOMOR}/FIK UNIK/{BULAN_ROMAWI}/{TAHUN}\""],
    [117, "Kategori arsip: \"Surat Keterangan Akademik FIK\""]
  ];

  let tcCount = 0;
  tcDataUpdates.forEach(([row, val]) => {
    if (row && val) {
      sheetTC.getRange(row, 7).setValue(val);
      tcCount++;
    }
  });
  Logger.log(`Berhasil memperbarui ${tcCount} baris TEST INPUT DATA pada tab 'Test Cases'`);

  // 2. Pembaruan Nilai Data Uji pada Tab 'Test Case Analysis'
  // Melakukan penggantian istilah data uji dummy lama menjadi data master UNIK yang presisi
  const lastRowAnalysis = sheetAnalysis.getLastRow();
  const rangeAnalysis = sheetAnalysis.getRange(1, 1, lastRowAnalysis, 4);
  const valuesAnalysis = rangeAnalysis.getValues();

  let analysisReplacements = 0;
  for (let r = 0; r < valuesAnalysis.length; r++) {
    for (let c = 0; c < valuesAnalysis[r].length; c++) {
      let cellText = String(valuesAnalysis[r][c] || "");
      if (!cellText) continue;

      let original = cellText;

      // Penggantian akun lama ke persona UNIK
      cellText = cellText.replace(/\bpakrektor\b/g, "rektor");
      cellText = cellText.replace(/\bbudisantoso\b/g, "staff.fik");
      cellText = cellText.replace(/\bstafflogistik\b/g, "staff.baku");
      
      // Penggantian unit kerja lama ke unit UNIK
      cellText = cellText.replace(/Biro Administrasi Umum/g, "Biro Administrasi Keuangan dan Umum (BAKU)");
      cellText = cellText.replace(/Fakultas Teknik(?!\s*UNIK)/g, "Fakultas Ilmu Kesehatan (FIK)");

      // Penggantian format penomoran ke UNIK
      cellText = cellText.replace(/001\/BAU\/2026/g, "{NOMOR}/BAKU/{BULAN_ROMAWI}/{TAHUN}");
      cellText = cellText.replace(/001\/FT\/2026/g, "{NOMOR}/FIK UNIK/{BULAN_ROMAWI}/{TAHUN}");

      // Penggantian template naskah dinas ke UNIK
      cellText = cellText.replace(/Surat Tugas Standar/g, "Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional");
      cellText = cellText.replace(/Surat Keputusan Rektor/g, "Surat Pengantar Usulan Akun SISTER Dosen");

      if (cellText !== original) {
        valuesAnalysis[r][c] = cellText;
        analysisReplacements++;
      }
    }
  }

  if (analysisReplacements > 0) {
    rangeAnalysis.setValues(valuesAnalysis);
    Logger.log(`Berhasil memperbarui ${analysisReplacements} sel data uji pada tab 'Test Case Analysis'`);
  }

  Logger.log("=== SINKRONISASI MASTER DATA UNIK SELESAI 100% ===");
}
