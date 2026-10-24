/**
 * scripts/sort-report.js
 * Mengurutkan hasil test Mochawesome pada merged-report.json
 * agar sesuai dengan urutan resmi dokumen Test Case (Spreadsheet No 1 s/d 126).
 */

const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '..', 'cypress', 'reports', 'merged-report.json');

if (!fs.existsSync(REPORT_PATH)) {
  console.warn(`[sort-report] File laporan tidak ditemukan: ${REPORT_PATH}`);
  process.exit(0);
}

// Urutan prioritas berkas fitur sesuai hierarki dokumen Test Case
const FILE_ORDER = [
  // 1. Autentikasi (No. 1 - 2)
  'cypress/e2e/features/auth/login.feature',

  // 2. Administrator & Master Data (No. 3 - 36)
  'cypress/e2e/features/admin/fr_adm_01_organisasi.feature',
  'cypress/e2e/features/admin/fr_adm_02_pengguna.feature',
  'cypress/e2e/features/admin/fr_adm_03_import.feature',
  'cypress/e2e/features/admin/fr_adm_04_template_surat.feature',
  'cypress/e2e/features/admin/fr_adm_05_kategori_template.feature',
  'cypress/e2e/features/admin/fr_adm_06_format_nomor.feature',

  // 3. Draft Surat Keluar & Naskah Dinas Elektronik
  'cypress/e2e/features/draft/fr_srt_01_pembuatan_draft.feature',
  'cypress/e2e/features/draft/fr_srt_02_editor_naskah.feature',
  'cypress/e2e/features/draft/fr_srt_03_asisten_ai.feature',
  'cypress/e2e/features/nde/fr_srt_04_pengiriman_surat.feature',
  'cypress/e2e/features/nde/fr_srt_05_backtrack_revisi.feature',

  // 4. Penerimaan & Surat Masuk Staf (No. 47 - 52, No. 81)
  'cypress/e2e/features/staf/fr_srt_06_surat_masuk.feature',
  'cypress/e2e/features/staf/fr_srt_07_pencarian_surat.feature',
  'cypress/e2e/features/staf/fr_srt_08_detail_surat.feature',
  'cypress/e2e/features/nde/fr_srt_09_11_dan_ttd.feature',

  // 5. Disposisi Surat (No. 59 - 64, jika ada di masa depan)
  'cypress/e2e/features/disposisi/fr_disp_01_buat_disposisi.feature',
  'cypress/e2e/features/disposisi/fr_disp_02_riwayat_disposisi.feature',
  'cypress/e2e/features/disposisi/fr_disp_03_instruksi_disposisi.feature',

  // 6. Pengajuan Publik & Pelacakan (No. 65 - 77)
  'cypress/e2e/features/guest/fr_req_01_pengajuan_publik.feature',
  'cypress/e2e/features/guest/fr_req_04_lacak_surat.feature',

  // 7. Portal Mahasiswa (No. 68, 78 - 80)
  'cypress/e2e/features/mahasiswa/fr_req_06_portal_mahasiswa.feature',

  // 8. Pengarsipan Surat & Kategori Arsip (No. 119 - 126)
  'cypress/e2e/features/arsip/fr_arc_01_arsipkan_surat.feature',
  'cypress/e2e/features/arsip/fr_arc_02_dan_03_arsip_surat.feature',
  'cypress/e2e/features/arsip/fr_arc_04_kategori_arsip.feature',

  // 9. Notifikasi Web & WhatsApp (No. 127 - 131)
  'cypress/e2e/features/notifikasi/fr_notif_01_web.feature',
  'cypress/e2e/features/notifikasi/fr_notif_02_wa.feature',
  'cypress/e2e/features/notifikasi/fr_notif_03_wa_gateway.feature',
];

function getFileRank(filePath) {
  if (!filePath) return 999;
  const normalized = filePath.replace(/\\/g, '/');
  const index = FILE_ORDER.findIndex((f) => normalized.endsWith(f) || f.endsWith(normalized));
  return index !== -1 ? index : 900;
}

try {
  const rawData = fs.readFileSync(REPORT_PATH, 'utf8');
  const report = JSON.parse(rawData);

  if (Array.isArray(report.results)) {
    // Urutkan results array berdasarkan FILE_ORDER
    report.results.sort((a, b) => {
      const rankA = getFileRank(a.file || a.fullFile);
      const rankB = getFileRank(b.file || b.fullFile);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (a.file || '').localeCompare(b.file || '');
    });

    console.log(`[sort-report] Berhasil mengurutkan ${report.results.length} spec suites sesuai urutan dokumen Test Case.`);
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  } else {
    console.warn('[sort-report] Properti report.results tidak berupa array. Melewati pengurutan.');
  }
} catch (error) {
  console.error('[sort-report] Gagal mengurutkan merged-report.json:', error);
  process.exit(1);
}
