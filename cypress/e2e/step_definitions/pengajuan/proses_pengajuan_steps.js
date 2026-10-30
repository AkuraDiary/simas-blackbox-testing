import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Helper: Membuka dropdown Filament secara andal menggunakan event mousedown (Alpine/Livewire)
const openDropdown = (dropdownLabel) => {
  cy.contains("button", dropdownLabel, { timeout: 10000 })
    .should("be.visible")
    .closest(".fi-dropdown-trigger")
    .trigger("mousedown", { force: true });
  cy.wait(800);
};

// ─── FR-PRC-01 & FR-PRC-02: DETAIL PENGAJUAN & INFORMASI ────────────────────────

let pengajuanPairIndex = 0;
beforeEach(() => {
  if (Cypress.currentTest.title.includes("TC-ALT-FR-PRC-04-A")) {
    pengajuanPairIndex = 0;
  }
});

When("Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel", () => {
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(800);
  cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-header-heading, .fi-page-header, main", { timeout: 15000 }).should("exist");

  // Periksa apakah surat yang dibuka memiliki tombol aksi proses/kembalikan yang aktif untuk Rektorat
  cy.get("body").then(($body) => {
    const hasActions = $body.find("button:contains('Proses Surat'), button:contains('Kembalikan / Tolak')").length > 0;
    if (!hasActions) {
      // Jika surat yang dibuka tidak memiliki tombol aksi pending, ajukan surat baru ke Rektorat via /pengajuan
      cy.visit("/pengajuan");
      cy.get("body", { timeout: 15000 }).should("be.visible");

      // Step 1: Template (Scratch)
      cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
        .scrollIntoView()
        .should("be.visible")
        .click({ force: true });
      cy.wait(1200);
      cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().should("be.visible").click({ force: true });
      cy.wait(1200);

      // Step 2: Data Pengirim
      cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
        .first()
        .clear({ force: true })
        .type("Mitra Penguji QA", { force: true });

      cy.get('input[id*="pengirim_email"], input[wire\\:model*="pengirim_email"]')
        .first()
        .clear({ force: true })
        .type("mitra.tester@gmail.com", { force: true });

      cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
        .first()
        .clear({ force: true })
        .type("081234567890", { force: true });

      cy.get('input[id*="pengirim_instansi"], input[wire\\:model*="pengirim_instansi"]')
        .first()
        .clear({ force: true })
        .type("PT Mitra Riset QA", { force: true });

      cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
      cy.wait(1200);

      // Step 3: Isi Surat
      cy.get("body").then(($b3) => {
        if ($b3.find('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').length > 0) {
          cy.get('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]')
            .first()
            .select(1, { force: true });
        } else {
          cy.contains("label", /Unit Tujuan/i)
            .parent()
            .find("select, input, button")
            .first()
            .then(($el) => {
              if ($el.is("select")) {
                cy.wrap($el).select(1, { force: true });
              } else {
                cy.wrap($el).click({ force: true });
                cy.wait(500);
                cy.get("li[role='option']").first().click({ force: true });
              }
            });
        }
      });

      const perihalUnik = `Permohonan Riset QA - ${Date.now()}`;
      cy.get('input[id*="perihal"], input[wire\\:model*="perihal"]')
        .first()
        .clear({ force: true })
        .type(perihalUnik, { force: true });

      cy.wait(1000);
      cy.window().then((win) => {
        const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
        if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
          const editor = win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
          if (editor) {
            editor.setContent("<p>Isi permohonan resmi pengujian QA otomatis oleh Cypress.</p>");
            editor.fire("change");
            editor.save();
            return;
          }
        }
        cy.get("body").then(($bTiny) => {
          if ($bTiny.find('iframe[id*="content_scratch"]').length > 0) {
            cy.get('iframe[id*="content_scratch"]')
              .its("0.contentDocument.body")
              .should("not.be.empty")
              .then(cy.wrap)
              .clear({ force: true })
              .type("Isi permohonan resmi pengujian QA otomatis", { force: true });
          } else if ($bTiny.find('textarea[id*="content_scratch"]').length > 0) {
            cy.get('textarea[id*="content_scratch"]').type("Isi permohonan resmi pengujian QA otomatis", { force: true });
          }
        });
      });

      cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
      cy.wait(1200);

      // Step 4: Lampiran
      cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
      cy.wait(1200);

      // Step 5: Konfirmasi
      cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]')
        .last()
        .check({ force: true });
      cy.get("button[type='submit']")
        .contains(/Kirim Sekarang|Kirim/i)
        .first()
        .click({ force: true });
      cy.contains(/Surat Berhasil Dikirim/i, { timeout: 15000 }).should("be.visible");

      // Login kembali sebagai pakrektor dan buka surat yang baru dibuat di tab Pengajuan
      cy.visit("/internal/login");
      cy.get("body").then(($b) => {
        if ($b.find("input[id*='username']").length > 0) {
          cy.get("input[id*='username']").first().clear({ force: true }).type("pakrektor", { force: true });
          cy.get("input[type='password']").first().clear({ force: true }).type("password", { force: true });
          cy.get("button[type='submit']").first().click({ force: true });
          cy.url({ timeout: 15000 }).should("include", "/internal");
        }
      });
      cy.visit("/internal/surat-masuk?activeTab=persetujuan");
      cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
      cy.wait(1200);
      cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
      cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
      cy.get(".fi-header-heading, .fi-page-header, main", { timeout: 15000 }).should("exist");
    }
  });
});

Then("Halaman detail surat menampilkan tipe surat pengajuan", () => {
  cy.contains(/Pengajuan/i, { timeout: 10000 }).should("exist");
});

Then("Halaman detail surat menampilkan section {string}", (sectionHeading) => {
  cy.contains(new RegExp(sectionHeading, "i"), { timeout: 10000 }).should("exist");
});

// ─── FR-PRC-03: LAMPIRAN BERKAS PEMOHON ────────────────────────────────────────

Then("Sistem memeriksa keberadaan section lampiran berkas pemohon", () => {
  cy.contains(/Lampiran Berkas/i, { timeout: 10000 }).should("exist");
});

When("Staf Unit mengklik tombol pratinjau lampiran berkas jika tersedia", () => {
  cy.get("body").then(($body) => {
    const $previewBtn = $body.find("button[wire\\:click*='openPreview']");
    if ($previewBtn.length > 0) {
      cy.wrap($previewBtn.first()).click({ force: true });
    }
  });
});

Then('Sistem menampilkan modal preview berkas "#preview-modal" atau memverifikasi link unduh berkas', () => {
  cy.get("body").then(($body) => {
    const $modal = $body.find("#preview-modal, [data-fi-modal-id='preview-modal']");
    const $downloadLink = $body.find("a[href*='/media/'][href*='/download']");
    const $emptyNotice = $body.find(":contains('Tidak ada berkas lampiran pada surat ini.')");

    const hasModal = $modal.length > 0;
    const hasDownload = $downloadLink.length > 0;
    const hasEmptyNotice = $emptyNotice.length > 0;

    expect(hasModal || hasDownload || hasEmptyNotice).to.be.true;

    // Jika modal terbuka, tutup modal
    if (hasModal && $modal.is(":visible")) {
      cy.get(".fi-modal-close-btn, [aria-label='Close']").first().click({ force: true });
    }
  });
});

When("Staf Unit membuka detail surat pengajuan tanpa lampiran", () => {
  cy.visit("/internal/surat-masuk/BWJxboYKegwO?scope=persetujuan");
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/BWJxboYKegwO");
});

Then("Halaman detail menampilkan keterangan {string}", (text) => {
  cy.contains(text, { timeout: 10000 }).should("exist");
});

// ─── FR-PRC-04: PENERUSAN PENGAJUAN (FORWARDING) ────────────────────────────────

When("Staf Unit membuka dropdown aksi {string}", (dropdownLabel) => {
  openDropdown(dropdownLabel);
});

When("Staf Unit memilih opsi proses {string}", (optionText) => {
  const cleanKeyword = optionText.split("(")[0].trim();
  cy.contains(".fi-dropdown-panel:visible button, .fi-dropdown-panel:visible a, .fi-dropdown-list-item", new RegExp(cleanKeyword, "i"), { timeout: 10000 })
    .click({ force: true });
  cy.wait(800);
});

Then("Modal penerusan surat terbuka", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengosongkan unit tujuan dan mengklik submit penerusan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Kirim|Teruskan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menolak submit dan menampilkan pesan error validasi penerusan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, .fi-fo-field-wrp-error-message, [role='dialog']:visible", { timeout: 8000 })
    .should("exist");
  // Tutup modal agar tidak menutupi langkah berikutnya
  cy.get("body").then(($body) => {
    const $closeBtn = $body.find(".fi-modal-window:visible .fi-modal-close-btn, .fi-modal-window:visible button:contains('Cancel'), .fi-modal-window:visible button:contains('Batal')");
    if ($closeBtn.length > 0) {
      cy.wrap($closeBtn.first()).click({ force: true });
    }
  });
});

When("Staf Unit memilih unit tujuan penerusan dan memasukkan catatan {string}", (catatan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.get("textarea[id*='catatan']").first().clear({ force: true }).type(catatan, { force: true });
    });

  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible").then(($modal) => {
    const $selectWrapper = $modal.find(".fi-fo-field-wrp:contains('Teruskan Ke Unit'), [data-field-wrapper]:contains('Teruskan Ke Unit')");
    if ($selectWrapper.length > 0) {
      cy.wrap($selectWrapper.first()).find("button, [role='combobox'], select").first().then(($trigger) => {
        if ($trigger.is("select")) {
          cy.wrap($trigger).select(1, { force: true });
        } else {
          cy.wrap($trigger).click({ force: true });
          cy.wait(800);
          cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last().find("[role='option'], li").first().click({ force: true });
        }
      });
    }
  });
});

When("Staf Unit mengonfirmasi penerusan surat", () => {
  pengajuanPairIndex++;
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Kirim|Teruskan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi sukses penerusan surat", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert']", { timeout: 15000 })
    .should("be.visible");
});

// ─── FR-PRC-05: PENGEMBALIAN & REVISI PENGAJUAN (BACKTRACK & REVISE) ─────────────

When("Staf Unit memilih opsi kembalikan {string}", (optionText) => {
  const cleanKeyword = optionText.split("(")[0].trim();
  cy.contains(".fi-dropdown-panel:visible button, .fi-dropdown-panel:visible a, .fi-dropdown-list-item", new RegExp(cleanKeyword, "i"), { timeout: 10000 })
    .click({ force: true });
  cy.wait(800);
});

Then("Modal pengembalian surat terbuka", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengosongkan alasan pengembalian dan mengklik submit", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.get("textarea[id*='catatan']").first().clear({ force: true });
      cy.contains("button, .fi-btn", /Submit|Kembalikan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menahan submit dan mewajibkan pengisian alasan pengembalian", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, .fi-fo-field-wrp-error-message, [role='dialog']:visible", { timeout: 8000 })
    .should("exist");
  // Tutup modal
  cy.get("body").then(($body) => {
    const $closeBtn = $body.find(".fi-modal-window:visible .fi-modal-close-btn, .fi-modal-window:visible button:contains('Cancel'), .fi-modal-window:visible button:contains('Batal')");
    if ($closeBtn.length > 0) {
      cy.wrap($closeBtn.first()).click({ force: true });
    }
  });
});

When("Staf Unit mengisi alasan pengembalian {string}", (alasan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.get("textarea[id*='catatan']").first().clear({ force: true }).type(alasan, { force: true });
    });
});

When("Staf Unit mengonfirmasi pengembalian surat", () => {
  pengajuanPairIndex++;
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Kembalikan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi sukses pengembalian surat", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert']", { timeout: 15000 })
    .should("be.visible");
});

Then("Modal pengembalian total terbuka", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengosongkan alasan revisi total dan mengklik submit", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.get("textarea[id*='catatan']").first().clear({ force: true });
      cy.contains("button, .fi-btn", /Submit|Kembalikan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menahan submit dan menampilkan validasi alasan revisi wajib diisi", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, .fi-fo-field-wrp-error-message, [role='dialog']:visible", { timeout: 8000 })
    .should("exist");
  // Tutup modal
  cy.get("body").then(($body) => {
    const $closeBtn = $body.find(".fi-modal-window:visible .fi-modal-close-btn, .fi-modal-window:visible button:contains('Cancel'), .fi-modal-window:visible button:contains('Batal')");
    if ($closeBtn.length > 0) {
      cy.wrap($closeBtn.first()).click({ force: true });
    }
  });
});

When("Staf Unit mengisi alasan revisi total {string}", (alasan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.get("textarea[id*='catatan']").first().clear({ force: true }).type(alasan, { force: true });
    });
});

When("Staf Unit mengonfirmasi revisi total pengajuan", () => {
  pengajuanPairIndex++;
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Kembalikan/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi pengembalian revisi total ke pembuat", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert']", { timeout: 15000 })
    .should("be.visible");
});

// ─── FR-PRC-05: PERSETUJUAN PENGAJUAN (APPROVAL) ────────────────────────────────

Then("Tabel menampilkan data pengajuan atau antrean kosong unit logistik", () => {
  cy.get(".fi-ta-content, table, body", { timeout: 15000 }).then(($root) => {
    const hasRows = $root.find("tbody tr.fi-ta-row").length > 0;
    const hasEmpty = $root.text().includes("Tidak Ada Data Surat");
    expect(hasRows || hasEmpty).to.be.true;
  });
});

Then("Tombol aksi persetujuan tidak dapat diakses untuk surat yang bukan wewenang logistik", () => {
  cy.get("body").then(($body) => {
    const hasAction = $body.find("button:contains('Proses Surat')").length > 0;
    expect(hasAction).to.be.false;
  });
});

When("Staf Unit memilih opsi persetujuan pengajuan yang tersedia", () => {
  cy.contains(".fi-dropdown-panel:visible button, .fi-dropdown-panel:visible a, .fi-dropdown-list-item", /Finalisasi & Selesai|Finalisasi|Setujui/i, { timeout: 10000 })
    .first()
    .click({ force: true });
  cy.wait(800);
});

Then("Sistem menampilkan modal persetujuan pengajuan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengisi catatan persetujuan {string}", (catatan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      const $textarea = Cypress.$("textarea[id*='catatan']");
      if ($textarea.length > 0) {
        cy.wrap($textarea.first()).clear({ force: true }).type(catatan, { force: true });
      }
    });
});

When("Staf Unit mengonfirmasi persetujuan pengajuan", () => {
  pengajuanPairIndex++;
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Setujui|Finalisasi/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi sukses persetujuan surat", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert']", { timeout: 15000 })
    .should("be.visible");
});

// ─── FR-PRC-06: PENYELESAIAN MANDIRI PENGAJUAN (FINISH) ──────────────────────────

When("Staf Unit memilih opsi penyelesaian surat {string}", (optionText) => {
  const cleanKeyword = optionText.split("(")[0].trim();
  cy.contains(".fi-dropdown-panel:visible button, .fi-dropdown-panel:visible a, .fi-dropdown-list-item", new RegExp(cleanKeyword, "i"), { timeout: 10000 })
    .click({ force: true });
  cy.wait(800);
});

Then("Sistem menampilkan modal finalisasi pengajuan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengisi catatan finalisasi {string}", (catatan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      const $textarea = Cypress.$("textarea[id*='catatan']");
      if ($textarea.length > 0) {
        cy.wrap($textarea.first()).clear({ force: true }).type(catatan, { force: true });
      }
    });
});

When("Staf Unit mengonfirmasi finalisasi pengajuan", () => {
  pengajuanPairIndex++;
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Finalisasi/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi bahwa pengajuan berhasil diselesaikan", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert']", { timeout: 15000 })
    .should("be.visible");
});

When('Staf Unit membuka salah satu surat pengajuan yang berstatus "SELESAI" jika ada', () => {
  cy.visit("/internal/surat-masuk/vkQBeXWdyK82?scope=persetujuan");
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/vkQBeXWdyK82");
});

Then("Sistem memastikan aksi proses surat tidak lagi mengizinkan finalisasi ganda", () => {
  cy.get("body").then(($body) => {
    const $finishOption = $body.find("button.fi-dropdown-list-item:contains('Finalisasi & Selesai')");
    expect($finishOption.length).to.equal(0);
  });
});
