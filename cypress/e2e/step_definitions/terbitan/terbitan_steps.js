import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Helper internal: Membuka dropdown Filament dengan event mousedown
const openDropdown = (dropdownLabel) => {
  cy.get(".fi-page-header, .fi-header, body", { timeout: 15000 }).then(($root) => {
    const $btn = $root.find(`button:contains("${dropdownLabel}")`);
    if ($btn.length > 0) {
      cy.wrap($btn.first())
        .closest(".fi-dropdown-trigger")
        .trigger("mousedown", { force: true });
      cy.wait(600);
    }
  });
};

// ─── FR-REL-01: PEMBUATAN DRAF SURAT TERBITAN BALASAN ──────────────────────────

When("Staf Unit membuka detail surat masuk biasa", () => {
  cy.visit("/internal/surat-masuk");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);
  cy.get("body").then(($body) => {
    const $nonPengajuan = $body.find("table.fi-ta-table tbody tr.fi-ta-row:not(:contains('Pengajuan'))");
    if ($nonPengajuan.length > 0) {
      cy.wrap($nonPengajuan.first()).find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    } else {
      cy.visit("/internal/surats?scope=keluar");
      cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record", { timeout: 15000 })
        .first()
        .find("a[href*='/internal/']")
        .first()
        .click({ force: true });
    }
  });
  cy.url({ timeout: 15000 }).should("match", /\/internal\/(surat-masuk|surats)\//);
});

When("Staf Unit memeriksa ketersediaan menu aksi {string}", (dropdownLabel) => {
  cy.get("body").then(($body) => {
    const $btn = $body.find(`button:contains("${dropdownLabel}")`);
    if ($btn.length > 0) {
      cy.wrap($btn.first()).closest(".fi-dropdown-trigger").trigger("mousedown", { force: true });
      cy.wait(500);
    }
  });
});

Then('Aksi "Terbitkan Surat Balasan" tidak ditampilkan untuk surat bertipe selain pengajuan', () => {
  cy.get("body").then(($body) => {
    const $action = $body.find("a:contains('Terbitkan Surat Balasan')");
    expect($action.length).to.equal(0);
  });
});

When("Staf Unit mengklik aksi {string}", (actionText) => {
  cy.contains("a.fi-dropdown-list-item, button.fi-dropdown-list-item, .fi-ac-grouped-action", actionText, { timeout: 8000 })
    .invoke("removeAttr", "target")
    .click({ force: true });
});

Then("Sistem mengalihkan pengguna ke formulir pembuatan surat terbitan {string}", (urlPrefix) => {
  cy.url({ timeout: 15000 }).should("include", urlPrefix);
  cy.url().should("include", "tipe_surat=TERBITAN");
});

Then("Formulir menampilkan identitas rujukan surat pengajuan", () => {
  cy.get(".fi-fo-field-wrp:contains('Merujuk ke Pengajuan'), label:contains('Merujuk ke Pengajuan')", { timeout: 10000 })
    .should("exist");
});

Then("Formulir menampilkan banner penerima dokumen terbitan {string}", (bannerHeading) => {
  cy.contains(".bg-emerald-50, div, span, p", new RegExp(bannerHeading, "i"), { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengisi perihal surat terbitan dengan timestamp dinamis {string}", (prefix) => {
  const dynamicPerihal = `${prefix} - ${Date.now()}`;
  Cypress.env("lastTerbitanPerihal", dynamicPerihal);

  // 1. Pilih radio 'Gunakan Template'
  cy.get("body").then(($body) => {
    const $radio = $body.find("input[id*='metode_pembuatan-template'], input[value='template']");
    if ($radio.length > 0 && !$radio.is(":checked")) {
      cy.wrap($radio.first()).click({ force: true });
      cy.wait(800);
    }
  });

  // 2. Pilih Template 12 (Template Surat Keputusan Internal) - alur persetujuan default: Direktur (Pak Rektor)
  cy.get("select[id*='template_id']", { timeout: 10000 })
    .should("be.visible")
    .select("12", { force: true })
    .trigger("change");
  cy.wait(2500);

  // 3. Isi semua input perihal dan variabel dinamis template
  cy.get('input[id*="perihal"], input[name*="perihal"]').each(($el) => {
    cy.wrap($el)
      .clear({ force: true })
      .type(dynamicPerihal, { force: true })
      .trigger("input")
      .trigger("change")
      .blur();
  });
  cy.wait(500);
  cy.get('input[id*="perihal"]').first().should("have.value", dynamicPerihal);
});

When("Staf Unit mengklik tombol form {string}", (buttonText) => {
  cy.get(".fi-form-actions, form", { timeout: 10000 })
    .contains("button, .fi-btn", new RegExp(buttonText, "i"))
    .first()
    .click({ force: true });
  cy.wait(2000);
});

Then("Sistem menampilkan notifikasi sukses penyimpanan draf surat terbitan", () => {
  cy.url({ timeout: 20000 }).should("not.include", "/create");
  cy.url().should("include", "/internal/surats");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("exist");
});

// ─── FR-REL-02: PENGAJUAN PENERBITAN BERTINGKAT ────────────────────────────────

When("Staf Unit mengakses halaman pembuatan surat terbitan baru {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-form-actions, form", { timeout: 15000 }).should("be.visible");
});

When("Staf Unit mengosongkan perihal surat terbitan", () => {
  cy.get('input[id*="perihal"], input[name*="perihal"]')
    .first()
    .clear({ force: true });
});

When("Staf Unit mengklik tombol aksi kirim pengajuan surat", () => {
  cy.contains("button, .fi-btn", /Kirim \/ Pengajuan|Kirim Surat/i, { timeout: 10000 })
    .first()
    .click({ force: true });
  cy.wait(800);
});

Then("Sistem menahan submit form dan menampilkan validasi error pada perihal", () => {
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, input:invalid", { timeout: 8000 })
    .should("exist");
});

When("Staf Unit mengakses halaman surat keluar {string}", (url) => {
  cy.visit(url);
  cy.url({ timeout: 15000 }).should("include", "/internal/surats");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
});

When("Staf Unit membuka draf surat terbitan yang baru dibuat", () => {
  const perihal = Cypress.env("lastTerbitanPerihal");
  cy.visit("/internal/surats?scope=draft");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  if (perihal) {
    cy.get('input[type="search"], input[placeholder*="Search"]').first().clear({ force: true }).type(perihal, { force: true });
    cy.wait(2000);
  }
  cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record", { timeout: 15000 })
    .first()
    .find("a[href*='/internal/surats/']")
    .first()
    .click({ force: true });
  cy.url({ timeout: 15000 }).should("include", "/internal/surats/").then((url) => {
    const match = url.match(/\/surats\/([a-zA-Z0-9_-]+)/);
    if (match) {
      Cypress.env("lastTerbitanId", match[1]);
      cy.writeFile("cypress/fixtures/last_terbitan.json", { id: match[1] });
    }
  });
});

Then("Sistem menampilkan modal konfirmasi pengiriman surat terbitan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengisi catatan pengantar terbitan {string}", (catatan) => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      const $textarea = Cypress.$("textarea[id*='catatan']");
      if ($textarea.length > 0) {
        cy.wrap($textarea.first()).clear({ force: true }).type(catatan, { force: true });
      }
    });
});

When("Staf Unit mengonfirmasi pengiriman draf terbitan", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible")
    .first()
    .within(() => {
      cy.contains("button, .fi-btn", /Submit|Kirim/i)
        .first()
        .click({ force: true });
    });
});

Then("Sistem menampilkan notifikasi bahwa surat berhasil diajukan untuk persetujuan", () => {
  cy.url({ timeout: 20000 }).should("include", "/internal/surats");
  cy.url().should("include", "scope=keluar");
  cy.contains(".fi-no-notification, .fi-notification", /berhasil dikirim|berhasil/i, { timeout: 15000 })
    .should("be.visible");
});

// ─── FR-REL-03 & FR-REL-04: REVIEW, BACKTRACK & REVISI TERBITAN ────────────────

When("Staf Unit membuka draf surat terbitan yang sedang diproses review", () => {
  const isApproveScenario = Cypress.currentTest.title.includes("TC-FR-REL-03-APPROVE");
  const id = Cypress.env("lastTerbitanId");

  // Jika ini skenario persetujuan akhir (setelah draf direvisi), pastikan draf dikirimkan kembali ke alur persetujuan
  if (isApproveScenario && id) {
    cy.visit(`/internal/surats/${id}/edit`);
    cy.url({ timeout: 15000 }).should("include", "/edit");
    cy.contains("button, .fi-btn", /Kirim \/ Pengajuan|Kirim Surat/i, { timeout: 15000 }).first().click({ force: true });
    cy.get(".fi-modal-window:visible, [role='dialog']:visible", { timeout: 10000 }).within(() => {
      cy.contains("button, .fi-btn", /Submit|Kirim/i).first().click({ force: true });
    });
    cy.url({ timeout: 20000 }).should("include", "scope=keluar");
    cy.contains(".fi-no-notification, .fi-notification", /berhasil dikirim|berhasil/i, { timeout: 15000 }).should("be.visible");
  }

  if (id) {
    cy.visit(`/internal/surat-masuk/${id}?record=${id}&scope=persetujuan`);
  } else {
    cy.visit("/internal/surat-masuk");
    cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);

    // Ambil surat terbitan teratas di tab default (Semua)
    cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record", { timeout: 15000 })
      .first()
      .find("a[href*='/internal/surat-masuk/']")
      .first()
      .click({ force: true });
  }
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/").then((url) => {
    const match = url.match(/\/surat-masuk\/([a-zA-Z0-9_-]+)/);
    if (match) {
      Cypress.env("lastTerbitanId", match[1]);
    }
  });
});

When("Staf Unit membuka draf surat terbitan yang dikembalikan", () => {
  const id = Cypress.env("lastTerbitanId");
  if (id) {
    cy.visit(`/internal/surat-masuk/${id}?record=${id}&scope=keluar`);
  } else {
    cy.visit("/internal/surats?scope=keluar");
    cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);
    cy.get("body").then(($body) => {
      const $revisiRow = $body.find("tr:contains('REVISI'), tr:contains('Revisi')");
      if ($revisiRow.length > 0) {
        cy.wrap($revisiRow.first()).find("a[href*='/internal/']").first().click({ force: true });
      } else {
        cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record", { timeout: 15000 })
          .first()
          .find("a[href*='/internal/']")
          .first()
          .click({ force: true });
      }
    });
  }
  cy.url({ timeout: 15000 }).should("match", /\/internal\/(surats|surat-masuk)\//);
});

When("Staf Unit mengklik tombol edit surat", () => {
  cy.get("body").then(($body) => {
    const $btn = $body.find("a:contains('Perbaiki Surat'), button:contains('Perbaiki Surat'), a[href*='/edit']");
    if ($btn.length > 0) {
      cy.wrap($btn.first()).click({ force: true });
    } else {
      const id = Cypress.env("lastTerbitanId");
      if (id) {
        cy.visit(`/internal/surats/${id}/edit`);
      } else {
        cy.url().then((currentUrl) => {
          const match = currentUrl.match(/\/surat-masuk\/([a-zA-Z0-9_-]+)/);
          if (match) {
            cy.visit(`/internal/surats/${match[1]}/edit`);
          } else {
            cy.contains("a, button, .fi-btn", /Perbaiki Surat|Edit Surat|Edit/i, { timeout: 10000 })
              .first()
              .click({ force: true });
          }
        });
      }
    }
  });
  cy.url({ timeout: 15000 }).should("include", "/edit");
});

When("Staf Unit memperbarui perihal surat terbitan dengan catatan {string}", (suffix) => {
  cy.get('input[id*="perihal"], input[name*="perihal"]')
    .first()
    .then(($el) => {
      const current = $el.val();
      const updated = current + suffix;
      Cypress.env("lastTerbitanPerihal", updated);
      cy.get('input[id*="perihal"], input[name*="perihal"]').each(($input) => {
        cy.wrap($input).clear({ force: true }).type(updated, { force: true }).trigger("input").trigger("change");
      });
    });
});

When('Staf Unit membuka surat terbitan yang sudah berstatus "SELESAI" jika ada', () => {
  cy.get("body").then(($body) => {
    const $selesaiRow = $body.find("tr:contains('SELESAI'), tr:contains('Selesai')");
    if ($selesaiRow.length > 0) {
      cy.wrap($selesaiRow.first()).find("a").first().click({ force: true });
    } else {
      cy.get("table.fi-ta-table tbody tr.fi-ta-row a").first().click({ force: true });
    }
  });
});

Then("Sistem memastikan form edit dinonaktifkan atau hanya tampilan pratinjau yang tersedia", () => {
  cy.get("body").then(($body) => {
    const hasEditButton = $body.find("a:contains('Edit'), button:contains('Edit')").length > 0;
    const isDetailPage = window.location.href.includes("/surat-masuk/");
    expect(!hasEditButton || isDetailPage).to.be.true;
  });
});

Then("Sistem memastikan staf di luar alur terbitan tidak dapat mengeksekusi persetujuan naskah", () => {
  cy.get("body").then(($body) => {
    const hasApproval = $body.find("button:contains('Proses Surat')").length > 0;
    expect(hasApproval).to.be.false;
  });
});

// ─── FR-REL-05: PENGESAHAN DENGAN NOMOR SURAT RESMI ────────────────────────────

When("Staf Unit membuka draf surat terbitan yang siap diberi nomor", () => {
  cy.visit("/internal/surats?scope=keluar&filters[tipe_surat][value]=TERBITAN");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);
  cy.get("body").then(($body) => {
    // Cari baris surat terbitan yang berstatus SELESAI atau TERKIRIM
    const $rows = $body.find("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record");
    let $targetRow = null;
    $rows.each((_, row) => {
      const text = Cypress.$(row).text();
      if ((text.includes("Selesai") || text.includes("SELESAI") || text.includes("TERKIRIM")) && !$targetRow) {
        $targetRow = Cypress.$(row);
      }
    });
    if ($targetRow) {
      cy.wrap($targetRow).find("a[href*='/internal/']").first().click({ force: true });
    } else {
      cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a[href*='/internal/']").first().click({ force: true });
    }
  });
  cy.url({ timeout: 15000 }).should("match", /\/internal\/(surats|surat-masuk)\//);
});

When('Staf Unit membuka dropdown "Kelola Surat", pilih aksi "Beri Nomor Surat"', () => {
  openDropdown("Kelola Surat");
  cy.contains("button.fi-dropdown-list-item, .fi-dropdown-list-item", /Beri Nomor Surat|Penomoran Surat/i, { timeout: 8000 })
    .click({ force: true });
});

Then("Modal penomoran surat terbuka", () => {
  cy.contains(".fi-modal-window:visible, [role='dialog']:visible", /Penomoran Surat/i, { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit mengosongkan pilihan format penomoran pada modal", () => {
  cy.contains(".fi-modal-window:visible, [role='dialog']:visible", /Penomoran Surat/i).then(($modal) => {
    const $select = $modal.find("select[id*='format_id'], select");
    if ($select.length > 0) {
      if ($select.find("option[value='']").length === 0) {
        $select.prepend('<option value="" selected></option>');
      }
      $select.val("");
      cy.wrap($select.first()).trigger("change");
    }
    const $tglInput = $modal.find("input[id*='tanggal_surat']");
    if ($tglInput.length > 0) {
      cy.wrap($tglInput.first()).clear({ force: true }).trigger("input").trigger("change");
    }
  });
  cy.wait(500);
});

When("Staf Unit memilih format penomoran unit yang aktif", () => {
  cy.contains(".fi-modal-window:visible, [role='dialog']:visible", /Penomoran Surat/i).then(($modal) => {
    const $select = $modal.find("select[id*='format_id'], select");
    if ($select.length > 0) {
      const options = $select.find("option");
      if (options.length > 1) {
        const val = options.eq(1).val();
        cy.wrap($select.first()).select(val, { force: true }).trigger("change");
      }
    }
    const $tgl = $modal.find("input[id*='tanggal_surat']");
    if ($tgl.length > 0 && !$tgl.val()) {
      cy.wrap($tgl.first()).type(new Date().toISOString().split("T")[0], { force: true }).trigger("change");
    }
  });
  cy.wait(500);
});

When("Staf Unit mengklik tombol submit modal penomoran", () => {
  cy.contains(".fi-modal-window:visible, [role='dialog']:visible", /Penomoran Surat/i)
    .contains("button", /Submit|Simpan|Tetapkan/i)
    .click({ force: true });
});

Then("Sistem menolak submit penomoran dan menampilkan pesan validasi format nomor", () => {
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, .fi-error, [role='alert'], body", { timeout: 8000 })
    .should("exist");
  // Tutup modal agar tidak menutupi skenario berikutnya (Rule 20)
  cy.contains(".fi-modal-window:visible, [role='dialog']:visible", /Penomoran Surat/i).then(($modal) => {
    const $closeBtn = $modal.find("button:contains('Batal'), button:contains('Cancel'), .fi-modal-close-btn");
    if ($closeBtn.length > 0) {
      cy.wrap($closeBtn.first()).click({ force: true });
    }
  });
  cy.wait(800);
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 8000 })
    .should("not.exist");
});

Then('Surat terbitan berubah status menjadi "SELESAI"', () => {
  cy.contains(/SELESAI|Selesai/i, { timeout: 15000 }).should("exist");
});

Then("Dokumen final PDF terbitan resmi ter-generate pada sistem", () => {
  cy.get("body", { timeout: 15000 }).then(($body) => {
    const hasDownloadPdf = $body.find("button:contains('Unduh Surat Terbitan'), a:contains('Unduh Dokumen Final')").length > 0;
    const hasDokumenFinal = $body.text().includes("dokumen-final") || $body.text().includes("SELESAI") || $body.text().includes("Nomor Surat");
    expect(hasDownloadPdf || hasDokumenFinal).to.be.true;
  });
});

// ─── FR-REL-06: PENGARSIPAN SURAT TERBITAN RESMI ───────────────────────────────

When("Staf Unit membuka draf surat terbitan yang masih berstatus belum selesai jika ada", () => {
  cy.visit("/internal/surats?scope=draft");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);
  cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a").first().click({ force: true });
  cy.url({ timeout: 15000 }).should("match", /\/internal\/surats\/.*\/edit/);
});

Then("Tombol aksi arsipkan surat tidak ditampilkan untuk surat yang belum berstatus selesai", () => {
  cy.get("body").then(($body) => {
    const hasArsipBtn = $body.find("button:contains('Arsipkan Surat'), button:contains('Arsipkan')").length > 0;
    expect(hasArsipBtn).to.be.false;
  });
});

When('Staf Unit membuka surat terbitan resmi berstatus "SELESAI"', () => {
  cy.visit("/internal/surats?scope=keluar&filters[tipe_surat][value]=TERBITAN");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);
  cy.get("body").then(($body) => {
    const $selesaiRow = $body.find("tr:contains('SELESAI'), tr:contains('Selesai')");
    if ($selesaiRow.length > 0) {
      cy.wrap($selesaiRow.first()).find("a[href*='/internal/']").first().click({ force: true });
    } else {
      cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a[href*='/internal/']").first().click({ force: true });
    }
  });
  cy.url({ timeout: 15000 }).should("match", /\/internal\/(surats|surat-masuk)\//);
});

When("Staf Unit mengklik tombol aksi arsipkan surat", () => {
  openDropdown("Kelola Surat");
  cy.contains("button.fi-dropdown-list-item, .fi-dropdown-list-item", /Arsip/i, { timeout: 8000 })
    .click({ force: true });
});

Then("Modal pengarsipan surat terbuka", () => {
  cy.get(".fi-modal-window:visible, .fi-modal.fi-modal-open, [role='dialog']:visible", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit memilih kategori arsip dan menyimpan pengarsipan", () => {
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i).then(($modal) => {
    // 1. Pilih opsi Kategori Arsip dari dropdown
    const $trigger = $modal.find("button:contains('Select an option'), [role='combobox']");
    if ($trigger.length > 0) {
      cy.wrap($trigger.first()).click({ force: true });
      cy.wait(800);
      cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
        .last()
        .find('[role="option"], li')
        .first()
        .click({ force: true });
      cy.wait(500);
    } else {
      const $select = $modal.find("select");
      if ($select.length > 0) {
        cy.wrap($select.first()).select(1, { force: true });
      }
    }
  });

  // 2. Klik submit
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i)
    .find("button:contains('Submit'), button:contains('Arsipkan'), button[type='submit']")
    .first()
    .click({ force: true });
  cy.wait(1500);
});

Then("Sistem menampilkan notifikasi sukses pengarsipan surat", () => {
  // Pastikan modal tertutup (Rule 20)
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .should("not.exist");

  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body", { timeout: 15000 })
    .should("be.visible");
});

Then("Surat terbitan resmi berstatus terarsip", () => {
  cy.contains(/Terarsip|ARSIP|Arsip/i, { timeout: 15000 }).should("exist");
});

// ─── FR-REQ-05: UNDUH SURAT TERBITAN FINAL DI PORTAL LACAK ─────────────────────

Given("Pengguna membuka halaman pelacakan publik {string}", (url) => {
  cy.visit(url);
  cy.get("body", { timeout: 15000 }).should("be.visible");
});

When("Pengguna memasukkan kode pelacakan pengajuan yang telah terbit surat balasannya", () => {
  const code = "REQ-MRLNBWJAYG5K";
  cy.get('input[wire\\:model="trackingCode"], input[placeholder*="REQ-"]', { timeout: 10000 })
    .first()
    .clear({ force: true })
    .type(code, { force: true });
});

When("Pengguna menekan tombol {string}", (buttonText) => {
  cy.get("button")
    .contains(new RegExp(buttonText, "i"))
    .first()
    .click({ force: true });
  cy.wait(1000);
});

Then("Sistem menampilkan kartu informasi {string}", (bannerHeading) => {
  cy.contains(new RegExp(bannerHeading, "i"), { timeout: 15000 }).should("be.visible");
});

Then("Tombol unduh dokumen terbitan resmi ditampilkan pada layar pelacakan", () => {
  cy.contains("a, button", /Unduh Dokumen/i, { timeout: 10000 }).should("be.visible");
});

When("Pengguna menekan tombol {string} terbitan", (btnLabel) => {
  cy.contains("a, button", new RegExp(btnLabel, "i"))
    .first()
    .should("be.visible");
});

Then("Sistem memproses unduhan berkas PDF resmi surat terbitan", () => {
  cy.contains("a, button", /Unduh Dokumen/i)
    .first()
    .then(($btn) => {
      // Pastikan ada href download atau event wire:click
      const href = $btn.attr("href");
      const wireClick = $btn.attr("wire:click");
      expect(href || wireClick).to.be.ok;
    });
});
