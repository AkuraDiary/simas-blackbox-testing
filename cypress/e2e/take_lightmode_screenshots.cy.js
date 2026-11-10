describe('Pengambilan Screenshot Light Mode Sub-Bab 4.3.3', () => {
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('theme', 'light');
    });
  });

  it('Alur Penuh Penerbitan Surat Terbitan Balasan', () => {
    cy.viewport(1440, 900);

    // 1. Submit Permohonan Guest/Mahasiswa
    cy.visit('/pengajuan');
    cy.get('html').invoke('removeClass', 'dark').invoke('addClass', 'light');
    cy.get('body').invoke('removeClass', 'dark').invoke('addClass', 'light');

    // Step 1: scratch
    cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    cy.wait(1200);
    cy.get('button').contains(/^\s*Lanjutkan\s*$/i).first().should('be.visible').click({ force: true });
    cy.wait(1500);

    // Step 2: Data Pengirim
    cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
      .first().clear({ force: true }).type('Mahasiswa Mandiri FIK (NIM 124)', { force: true });

    cy.get('input[id*="pengirim_email"], input[wire\\:model*="pengirim_email"]')
      .first().clear({ force: true }).type('mahasiswa.fik@unik-kediri.ac.id', { force: true });

    cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
      .first().clear({ force: true }).type('081234567890', { force: true });

    cy.get('input[id*="pengirim_instansi"], input[wire\\:model*="pengirim_instansi"]')
      .first().clear({ force: true }).type('Fakultas Ilmu Kesehatan UNIK', { force: true });

    cy.get('button').contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
    cy.wait(2000);

    // Step 3: Isi Surat & Unit Tujuan
    cy.get('body').then(($b3) => {
      if ($b3.find('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').length > 0) {
        cy.get('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').first().select(1, { force: true });
      }
    });

    cy.get('input[id*="perihal"], input[wire\\:model*="perihal"]')
      .first().clear({ force: true }).type('Surat Permohonan Izin Penelitian Lapangan Mahasiswa FIK', { force: true });

    cy.wait(1000);
    cy.window().then((win) => {
      const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
      if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
        const editor = win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
        if (editor) {
          editor.setContent('<p>Dengan hormat, kami mengajukan permohonan penerbitan surat izin penelitian lapangan bagi mahasiswa FIK.</p>');
          editor.fire('change');
          editor.save();
        }
      }
    });

    cy.get('button').contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
    cy.wait(1500);

    // Step 4: Lampiran
    cy.get('button').contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
    cy.wait(1500);

    // Step 5: Konfirmasi
    cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]')
      .last()
      .check({ force: true });
    cy.get("button[type='submit']")
      .contains(/Kirim Sekarang|Kirim/i)
      .first()
      .click({ force: true });
    cy.wait(5000);

    // Simpan Kode Tracking
    cy.get('body').then(($bRes) => {
      const text = $bRes.text();
      const m = text.match(/REQ-[A-Z0-9]+/);
      if (m) {
        cy.log('Tracking code generated:', m[0]);
      }
    });

    // 2. Login Staff Rektorat
    cy.visit('/internal/login');
    cy.get('input[id*="username"], input[type="text"]').first().type('staff.rektorat', { force: true });
    cy.get('input[id*="password"], input[type="password"]').first().type('password123', { force: true });
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(3500);

    // Buka Surat Masuk Rektorat
    cy.visit('/internal/surat-masuk');
    cy.wait(3000);

    // Klik tab Pengajuan jika ada
    cy.get('body').then(($bTab) => {
      if ($bTab.find('button[role="tab"]:contains("Pengajuan"), .fi-tabs-item:contains("Pengajuan")').length > 0) {
        cy.get('button[role="tab"]:contains("Pengajuan"), .fi-tabs-item:contains("Pengajuan")').first().click({ force: true });
        cy.wait(2000);
      }
    });

    // Buka surat masuk pertama
    cy.get('table tbody tr.fi-ta-row a[href*="/internal/surat-masuk/"]').first().click({ force: true });
    cy.wait(4000);

    // Buka Kelola Surat -> Terbitkan Surat Balasan
    cy.contains('button', /Kelola Surat/i).click({ force: true });
    cy.wait(1500);
    cy.contains(/Terbitkan Surat Balasan/i).click({ force: true });
    cy.wait(5000);

    // Pastikan light mode
    cy.get('html').invoke('removeClass', 'dark').invoke('addClass', 'light');
    cy.get('body').invoke('removeClass', 'dark').invoke('addClass', 'light');

    // TANGKAPAN LAYAR 1
    cy.screenshot('[1] Membuat Surat Terbitan dari Pengajuan', { capture: 'viewport' });

    // Simpan Draft
    cy.contains('button', /Simpan Draft|Simpan/i).click({ force: true });
    cy.wait(5000);

    // Buka Modal Pengajuan Review
    cy.contains('button', /Kirim \/ Pengajuan|Kirim Surat|Kirim/i).click({ force: true });
    cy.wait(3000);
    cy.get('html').invoke('removeClass', 'dark').invoke('addClass', 'light');
    cy.get('body').invoke('removeClass', 'dark').invoke('addClass', 'light');

    // TANGKAPAN LAYAR 2
    cy.screenshot('[2] Pengajuan Review Bertingkat Surat Terbitan', { capture: 'viewport' });

    // Submit modal pengajuan
    cy.get('.fi-modal button, [role="dialog"] button').contains(/Kirim|Submit|Konfirmasi/i).click({ force: true });
    cy.wait(5000);

    // 3. Login Pak Rektor
    cy.visit('/internal/login');
    cy.get('input[id*="username"], input[type="text"]').first().type('pakrektor', { force: true });
    cy.get('input[id*="password"], input[type="password"]').first().type('password', { force: true });
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(3500);

    // Buka Surat Masuk Rektor
    cy.visit('/internal/surat-masuk');
    cy.wait(3500);
    cy.get('table tbody tr.fi-ta-row a[href*="/internal/surat-masuk/"]').first().click({ force: true });
    cy.wait(4500);
    cy.get('html').invoke('removeClass', 'dark').invoke('addClass', 'light');
    cy.get('body').invoke('removeClass', 'dark').invoke('addClass', 'light');

    // TANGKAPAN LAYAR 3
    cy.screenshot('[3] Antarmuka Review dan Persetujuan Pimpinan', { capture: 'viewport' });

    // Finalisasi & Selesaikan Surat
    cy.contains('button', /Proses Surat/i).click({ force: true });
    cy.wait(1500);
    cy.contains(/Finalisasi & Selesaikan Surat|Finalisasi & Selesai|Setujui/i).click({ force: true });
    cy.wait(2500);
    cy.get('body').then(($b) => {
      if ($b.find('.fi-modal button').length > 0) {
        cy.get('.fi-modal button').contains(/Selesaikan|Konfirmasi|Ya|Setujui/i).click({ force: true });
      }
    });
    cy.wait(5000);
    cy.get('html').invoke('removeClass', 'dark').invoke('addClass', 'light');
    cy.get('body').invoke('removeClass', 'dark').invoke('addClass', 'light');

    // TANGKAPAN LAYAR 4
    cy.screenshot('[4] Penetapan Nomor Sah dan Penyelesaian Surat Terbitan', { capture: 'viewport' });
  });
});
