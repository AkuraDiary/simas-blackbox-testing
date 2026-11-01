/**
 * Script Google Apps Script: Sinkronisasi Tab "UAT Final" pada Dokumen Google Docs
 * Dokumen: https://docs.google.com/document/d/1d0SDghhfMag6ZNAGw7j6jRUuFMP1IVVSkkBWatsAy7I/edit?usp=sharing
 * Tab Target: "UAT Final" (tab=t.5vbaoobeqikt)
 * 
 * Petunjuk Eksekusi:
 * 1. Buka dokumen Google Docs di browser
 * 2. Klik Extensions (Ekstensi) > Apps Script
 * 3. Hapus kode default (jika ada), paste seluruh isi file ini
 * 4. Pilih fungsi `syncUatFinalDocs` lalu klik tombol Run (Jalankan)
 * 5. Berikan izin saat pertama kali dijalankan
 */

function syncUatFinalDocs() {
  const doc = DocumentApp.getActiveDocument();
  if (!doc) {
    throw new Error("Dokumen Google Docs aktif tidak ditemukan!");
  }

  Logger.log("=== Memulai Sinkronisasi Data Uji Tab UAT Final Google Docs ===");

  // Daftar pasangan penggantian data uji (dari dummy ke data master UNIK riil)
  const replacements = [
    // 1. Akun & Kredensial Persona UNIK
    { pattern: "pakrektor", replacement: "rektor" },
    { pattern: "budisantoso", replacement: "staff.fik" },
    { pattern: "stafflogistik", replacement: "staff.baku" },

    // 2. Unit Kerja Resmi UNIK
    { pattern: "Biro Administrasi Umum", replacement: "Biro Administrasi Keuangan dan Umum (BAKU)" },
    { pattern: "Fakultas Teknik", replacement: "Fakultas Ilmu Kesehatan (FIK)" },

    // 3. Format Penomoran Surat Resmi UNIK
    { pattern: "001/BAU/2026", replacement: "{NOMOR}/BAKU/{BULAN_ROMAWI}/{TAHUN}" },
    { pattern: "001/FT/2026", replacement: "{NOMOR}/FIK UNIK/{BULAN_ROMAWI}/{TAHUN}" },

    // 4. Template Naskah Dinas Resmi UNIK
    { pattern: "Surat Tugas Standar", replacement: "Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional" },
    { pattern: "Surat Keputusan Rektor", replacement: "Surat Pengantar Usulan Akun SISTER Dosen" }
  ];

  let totalReplacements = 0;

  // Dapatkan semua tab jika didukung oleh versi Google Docs API saat ini
  let bodiesToProcess = [];
  try {
    if (typeof doc.getTabs === "function") {
      const tabs = doc.getTabs();
      for (const tab of tabs) {
        const title = tab.getTitle ? tab.getTitle() : "";
        const id = tab.getId ? tab.getId() : "";
        // Prioritaskan tab UAT Final atau proses tab yang relevan
        if (title.toLowerCase().includes("uat") || id === "t.5vbaoobeqikt") {
          bodiesToProcess.push(tab.asDocumentTab().getBody());
          Logger.log(`Menemukan tab spesifik: "${title}" (ID: ${id})`);
        }
      }
    }
  } catch (e) {
    Logger.log("Peringatan saat memeriksa tabs: " + e.message);
  }

  // Jika tidak ditemukan tab spesifik atau API tabs belum aktif, gunakan body utama
  if (bodiesToProcess.length === 0) {
    bodiesToProcess.push(doc.getBody());
    Logger.log("Memproses Body dokumen utama.");
  }

  // Eksekusi penggantian teks pada setiap body yang ditemukan
  for (const body of bodiesToProcess) {
    for (const item of replacements) {
      let count = 0;
      let foundElement = body.findText(item.pattern);
      while (foundElement !== null) {
        const textElement = foundElement.getElement().asText();
        const start = foundElement.getStartOffset();
        const end = foundElement.getEndOffsetInclusive();

        textElement.deleteText(start, end);
        textElement.insertText(start, item.replacement);

        count++;
        totalReplacements++;

        // Cari kemunculan berikutnya
        foundElement = body.findText(item.pattern, foundElement);
      }
      if (count > 0) {
        Logger.log(`Mengganti "${item.pattern}" -> "${item.replacement}": ${count} kali`);
      }
    }
  }

  Logger.log(`=== SINKRONISASI SELESAI: ${totalReplacements} penggantian teks berhasil diterapkan! ===`);
}
