/**
 * Script Google Apps Script: Sinkronisasi FR-ADM-07 (Manajemen Konfigurasi dan Token Layanan AI)
 * 
 * Target Spreadsheet:
 * 1. TestCase Document (Tab 'Test Cases' & 'Test Case Analysis'):
 *    URL: https://docs.google.com/spreadsheets/d/1565c4qhdnLO3XK_uuM7VWCUN86_H29-WeGCuDKt2nDM/edit?usp=sharing
 * 
 * 2. Requirement Document (Tab 'Requirement Refined' & 'Usecase RTM'):
 *    URL: https://docs.google.com/spreadsheets/d/1jcGDnmAoht1WHBk3pA0L9IeWd1xWD6av1zfZLPcBFfs/edit?usp=sharing
 * 
 * 3. FR Recap Document:
 *    URL: https://docs.google.com/spreadsheets/d/1X4r5FEjGdkxWg8EdF_c7Q_-Lpw3Q384WcgidAoiFK18/edit?usp=sharing
 * 
 * Cara Penggunaan:
 * 1. Buka salah satu spreadsheet target di atas melalui peramban web.
 * 2. Klik menu Extensions (Ekstensi) > Apps Script.
 * 3. Tempelkan seluruh isi berkas ini ke dalam editor Apps Script.
 * 4. Pilih fungsi yang ingin dijalankan pada bilah atas:
 *    - Jalankan syncAiTokenTestCases() pada Spreadsheet TestCase Document.
 *    - Jalankan syncAiTokenRequirement() pada Spreadsheet Requirement / FR Recap.
 * 5. Klik tombol "Run" (Jalankan) dan berikan izin otorisasi saat eksekusi pertama.
 * 
 * Karakteristik Teknis:
 * - Bersifat idempoten (idempotent): dilengkapi proteksi pemeriksaan duplikasi data sebelum penambahan.
 * - Non-destruktif: tidak menimpa atau menggeser data kasus uji terdahulu.
 * - Format 13 kolom baku: mematuhi Aturan Rule 10 proyek di mana kolom REQUIREMENT ID dikosongkan pada baris turunan/negatif.
 * - Tanpa metode Error Guessing: analisis data uji hanya menggunakan Use Case Testing dan Equivalence Partitioning.
 */

// =============================================================================
// FUNGSI 1: Sinkronisasi Tab 'Test Cases' dan 'Test Case Analysis'
// =============================================================================
function syncAiTokenTestCases() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTC = ss.getSheetByName("Test Cases");
  const sheetAnalysis = ss.getSheetByName("Test Case Analysis");

  if (!sheetTC) {
    throw new Error("Sheet 'Test Cases' tidak ditemukan pada spreadsheet aktif!");
  }
  if (!sheetAnalysis) {
    throw new Error("Sheet 'Test Case Analysis' tidak ditemukan pada spreadsheet aktif!");
  }

  Logger.log("=== Memulai Sinkronisasi FR-ADM-07 pada Dokumen Test Cases ===");

  // ---------------------------------------------------------------------------
  // 1. Pembaruan Tab 'Test Cases' (13 Kolom Baku)
  // ---------------------------------------------------------------------------
  const lastRowTC = sheetTC.getLastRow();
  let alreadyExistsTC = false;

  if (lastRowTC > 1) {
    const tcIds = sheetTC.getRange(1, 3, lastRowTC, 1).getValues().flat();
    alreadyExistsTC = tcIds.includes("TC-FR-ADM-07-A");
  }

  if (alreadyExistsTC) {
    Logger.log("[Test Cases] Kasus uji TC-FR-ADM-07-A sudah terdaftar. Melewati penambahan baris.");
  } else {
    // Susunan 6 Kasus Uji Fungsional Pengguna (No. 136 s.d. 141)
    // Aturan Rule 10: Kolom ke-2 (REQUIREMENT ID) hanya terisi pada skenario positif utama
    const newTestCases = [
      [
        "136", "FR-ADM-07", "TC-FR-ADM-07-A",
        "Administrator menambahkan kredensial token Google Gemini baru yang valid",
        "Administrator login dan mengakses halaman menu \"Konfigurasi AI\"",
        "1. Klik tombol \"Tambah Token Baru\"\n2. Pilih provider \"Google Gemini\"\n3. Masukkan label \"Token Gemini Kampus\"\n4. Masukkan API Key \"AIzaSyDummyKeyValid123\" dan Model \"gemini-2.5-flash\"\n5. Klik tombol \"Simpan\"",
        "Provider: \"gemini\", Label: \"Token Gemini Kampus\", API Key: \"AIzaSyDummyKeyValid123\", Model: \"gemini-2.5-flash\"",
        "Token berhasil ditambahkan ke daftar, kunci API ditampilkan secara tersamar (masked), dan notifikasi sukses muncul",
        "Positive Testing", "Normal Case", "Seta (Automation QA)", "Passed", "Automated"
      ],
      [
        "137", "", "TC-ALT-FR-ADM-07-A",
        "Validasi penolakan penambahan token saat field formulir wajib dikosongkan",
        "Modal formulir tambah token AI terbuka",
        "1. Buka modal tambah token baru\n2. Kosongkan field provider, label, dan API key\n3. Klik tombol \"Simpan\"",
        "Field formulir token: [Kosong]",
        "Sistem menolak penyimpanan dan menampilkan pesan validasi error bahwa kolom wajib diisi",
        "Negative Testing", "Boundary Case", "Seta (Automation QA)", "Passed", "Automated"
      ],
      [
        "138", "", "TC-FR-ADM-07-B",
        "Administrator mengaktifkan token Gemini sebagai token layanan utama sistem",
        "Terdapat token Gemini nonaktif pada tabel Konfigurasi AI",
        "1. Cari baris token \"Token Gemini Kampus\"\n2. Klik tombol aksi \"Aktifkan\"\n3. Konfirmasi pengaktifan",
        "ID Token Gemini valid",
        "Status token berubah menjadi Aktif (badge hijau), token lain otomatis nonaktif, dan widget status memperbarui sumber aktif",
        "Positive Testing", "Normal Case", "Seta (Automation QA)", "Passed", "Automated"
      ],
      [
        "139", "", "TC-FR-ADM-07-C",
        "Administrator menambahkan dan mengaktifkan token Ollama lokal kampus",
        "Administrator berada pada halaman Konfigurasi AI",
        "1. Klik \"Tambah Token Baru\"\n2. Pilih provider \"Ollama\"\n3. Isi label \"Ollama Server Kampus\" dan Base URL \"http://localhost:11434\"\n4. Simpan dan klik aksi \"Aktifkan\"",
        "Provider: \"ollama\", Label: \"Ollama Server Kampus\", Base URL: \"http://localhost:11434\", Model: \"gpt-oss:20b\"",
        "Token Ollama tersimpan dan status aktif berhasil dialihkan ke penyedia Ollama",
        "Positive Testing", "Normal Case", "Seta (Automation QA)", "Passed", "Automated"
      ],
      [
        "140", "", "TC-FR-ADM-07-D",
        "Administrator mematikan toggle fitur asisten AI secara global",
        "Sakelar fitur asisten AI berstatus aktif",
        "1. Klik sakelar toggle \"Fitur Asisten AI\" menjadi nonaktif (OFF)\n2. Konfirmasi perubahan status\n3. Buka formulir draf surat staf",
        "Toggle state: OFF (Nonaktif)",
        "Sistem menonaktifkan fitur AI secara global, tombol \"Bantuan AI (Draft Surat)\" otomatis disembunyikan dari formulir staf",
        "Positive Testing", "Normal Case", "Seta (Automation QA)", "Passed", "Automated"
      ],
      [
        "141", "", "TC-FR-ADM-07-E",
        "Administrator menyalakan kembali toggle fitur asisten AI secara global",
        "Sakelar fitur asisten AI berstatus nonaktif",
        "1. Klik sakelar toggle \"Fitur Asisten AI\" menjadi aktif (ON)\n2. Konfirmasi perubahan status\n3. Buka formulir draf surat staf",
        "Toggle state: ON (Aktif)",
        "Sistem mengaktifkan kembali fitur AI, tombol \"Bantuan AI (Draft Surat)\" muncul kembali pada formulir pembuatan surat staf",
        "Positive Testing", "Normal Case", "Seta (Automation QA)", "Passed", "Automated"
      ]
    ];

    const targetRowTC = lastRowTC + 1;
    sheetTC.getRange(targetRowTC, 1, newTestCases.length, 13).setValues(newTestCases);
    Logger.log(`[Test Cases] Berhasil menambahkan 6 kasus uji baru pada baris ${targetRowTC} s/d ${targetRowTC + newTestCases.length - 1}`);
  }

  // ---------------------------------------------------------------------------
  // 2. Pembaruan Tab 'Test Case Analysis' (Blok Analisis EQP & Use Case Testing)
  // ---------------------------------------------------------------------------
  const lastRowAnalysis = sheetAnalysis.getLastRow();
  let alreadyExistsAnalysis = false;

  if (lastRowAnalysis > 1) {
    const analysisTexts = sheetAnalysis.getRange(1, 1, lastRowAnalysis, 2).getValues().flat();
    alreadyExistsAnalysis = analysisTexts.some(t => String(t).includes("FR-ADM-07"));
  }

  if (alreadyExistsAnalysis) {
    Logger.log("[Test Case Analysis] Blok analisis FR-ADM-07 sudah terdaftar. Melewati penambahan.");
  } else {
    const analysisBlock = [
      ["Analysis for ", "FR-ADM-07 (Manajemen Konfigurasi dan Token Layanan AI)", "", ""],
      ["ID : ", "FR-ADM-07 - DATA", "", ""],
      ["Method :", "Equivalence Partitioning & Use Case Testing", "", ""],
      ["Valid Scenario", "", "", ""],
      ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
      ["Administrator menambahkan kredensial token Google Gemini valid", "Provider: \"gemini\", Label: \"Token Gemini Kampus\", API Key valid, Model: \"gemini-2.5-flash\"", "Token berhasil disimpan, ditampilkan dengan API key tersamar, dan notifikasi sukses muncul", "TC-FR-ADM-07-A"],
      ["Administrator mengaktifkan token Gemini sebagai token utama", "ID Token Gemini valid", "Status token berubah menjadi Aktif, token lain otomatis nonaktif, widget status terbarui", "TC-FR-ADM-07-B"],
      ["Administrator menambahkan dan mengaktifkan token penyedia Ollama", "Provider: \"ollama\", Base URL: \"http://localhost:11434\", Model: \"gpt-oss:20b\"", "Token Ollama tersimpan dan status aktif berhasil dialihkan ke penyedia Ollama", "TC-FR-ADM-07-C"],
      ["Administrator mematikan sakelar toggle fitur asisten AI secara global", "Sakelar toggle disetel ke nonaktif (OFF)", "Fitur dinonaktifkan secara terpusat, tombol Bantuan AI pada formulir staf disembunyikan", "TC-FR-ADM-07-D"],
      ["Administrator menyalakan kembali sakelar toggle fitur asisten AI", "Sakelar toggle disetel ke aktif (ON)", "Fitur diaktifkan kembali, tombol Bantuan AI muncul kembali pada formulir staf", "TC-FR-ADM-07-E"],
      ["", "", "", ""],
      ["Invalid Scenario", "", "", ""],
      ["Skenario", "Data", "Expected Result", "Referensi Test Case ID"],
      ["Validasi formulir saat kolom wajib penambahan token dikosongkan", "Field provider, label, dan kredensial token: [Kosong]", "Sistem menolak penyimpanan dan menampilkan pesan kesalahan validasi pada kolom wajib", "TC-ALT-FR-ADM-07-A"],
      ["", "", "", ""]
    ];

    const targetRowAnalysis = lastRowAnalysis + 2;
    sheetAnalysis.getRange(targetRowAnalysis, 1, analysisBlock.length, 4).setValues(analysisBlock);
    Logger.log(`[Test Case Analysis] Berhasil menambahkan blok analisis FR-ADM-07 pada baris ${targetRowAnalysis}`);
  }

  Logger.log("=== Selesai: Sinkronisasi TestCase Document Berhasil 100% ===");
}

// =============================================================================
// FUNGSI 2: Sinkronisasi Tab 'Requirement Refined' dan 'Usecase RTM'
// =============================================================================
function syncAiTokenRequirement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetRefined = ss.getSheetByName("Requirement Refined");
  const sheetRTM = ss.getSheetByName("Usecase RTM");

  if (!sheetRefined) {
    throw new Error("Sheet 'Requirement Refined' tidak ditemukan pada spreadsheet aktif!");
  }

  Logger.log("=== Memulai Sinkronisasi FR-ADM-07 pada Dokumen Requirement ===");

  // 1. Pembaruan Tab 'Requirement Refined'
  const lastRowRefined = sheetRefined.getLastRow();
  let alreadyExistsRefined = false;

  if (lastRowRefined > 1) {
    const frCodes = sheetRefined.getRange(1, 4, lastRowRefined, 1).getValues().flat();
    alreadyExistsRefined = frCodes.includes("FR-ADM-07");
  }

  if (alreadyExistsRefined) {
    Logger.log("[Requirement Refined] FR-ADM-07 sudah terdaftar. Melewati penambahan.");
  } else {
    // Baris kebutuhan fungsional ke-53
    const newFrData = [
      "53.0",
      "Administrasi Sistem",
      "Konfigurasi AI",
      "FR-ADM-07",
      "Manajemen Konfigurasi dan Token Layanan AI",
      "Admin dapat mengelola kredensial token AI multi-provider (Google Gemini dan Ollama), mengatur token aktif tunggal, mengaktifkan atau menonaktifkan fitur pembuatan draf AI secara terpusat, serta memanfaatkan fallback otomatis ke konfigurasi environment.",
      "Sebagai Admin, saya ingin mengelola konfigurasi dan token layanan AI (menambah, mengaktifkan, menonaktifkan fitur secara terpusat, dan memanfaatkan fallback environment), sehingga integrasi asisten naskah dinas dapat dikontrol secara mandiri tanpa modifikasi berkas server.",
      "Admin"
    ];

    sheetRefined.appendRow(newFrData);
    Logger.log(`[Requirement Refined] Berhasil menambahkan FR-ADM-07 pada baris ${sheetRefined.getLastRow()}`);
  }

  // 2. Pembaruan Tab 'Usecase RTM' jika tersedia
  if (sheetRTM) {
    const lastRowRTM = sheetRTM.getLastRow();
    let alreadyExistsRTM = false;

    if (lastRowRTM > 1) {
      const rtmCodes = sheetRTM.getRange(1, 4, lastRowRTM, 1).getValues().flat();
      alreadyExistsRTM = rtmCodes.includes("FR-ADM-07");
    }

    if (alreadyExistsRTM) {
      Logger.log("[Usecase RTM] FR-ADM-07 sudah terdaftar pada Usecase RTM. Melewati penambahan.");
    } else {
      const newRtmData = [
        "53.0",
        "Administrasi Sistem",
        "Konfigurasi AI",
        "FR-ADM-07",
        "Manajemen Konfigurasi dan Token Layanan AI"
      ];
      sheetRTM.appendRow(newRtmData);
      Logger.log(`[Usecase RTM] Berhasil menambahkan FR-ADM-07 pada baris ${sheetRTM.getLastRow()}`);
    }
  }

  Logger.log("=== Selesai: Sinkronisasi Requirement Berhasil 100% ===");
}
