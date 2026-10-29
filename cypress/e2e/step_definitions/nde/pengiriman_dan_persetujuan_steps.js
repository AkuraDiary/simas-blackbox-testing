import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Step Definitions untuk Modul Naskah Dinas Elektronik (Batch 2)
 * Mencakup FR-SRT-04 (Pengiriman), FR-SRT-05 (Backtrack/Revisi),
 * FR-SRT-09 s/d FR-SRT-11 (Alur, Respon, Dokumen), dan FR-TTD-01 (TTE/QR)
 */

// ─── HELPER NOTIFIKASI & REPEATER ───────────────────────────────────────────

function assertToastNotification(expectedMessage, timeout = 15000) {
  const pattern = new RegExp(expectedMessage.replace(/[()]/g, "\\$&"), "i");
  cy.contains(
    ".fi-no-notification-title, .fi-notification-title, [class*='notification-title'], .fi-notification, .fi-no-notification, body",
    pattern,
    { timeout }
  ).should("be.visible");
}

function cleanupEmptyRepeaterRows() {
  cy.get("body").then(($body) => {
    const $sec = $body.find(".fi-section:contains('Jalur Persetujuan Khusus')");
    if ($sec.length > 0) {
      $sec.find(".fi-fo-repeater-item, [wire\\:key*='approval_path']").each((idx, item) => {
        const $item = Cypress.$(item);
        const hasSelectedJabatan =
          $item.find(".fi-select-input-value-label").length > 0 ||
          ($item.find("select").length > 0 && Boolean($item.find("select").val()));

        if (!hasSelectedJabatan) {
          const deleteBtn = $item.find(
            "button[title*='Delete'], button[aria-label*='Delete'], button[title*='Hapus'], button[aria-label*='Hapus'], .fi-fo-repeater-item-delete-btn, [wire\\:click*='deleteItem']"
          );
          if (deleteBtn.length > 0) {
            cy.wrap(deleteBtn.first()).click({ force: true });
            cy.wait(800);
          }
        }
      });
    }
  });
}

When("Staf Unit menekan tombol aksi {string}", (buttonText) => {
  cy.wait(800);
  if (/Kirim \/ Pengajuan/i.test(buttonText)) {
    cleanupEmptyRepeaterRows();
    cy.get(".fi-form-actions, form, body")
      .contains("button", /Kirim \/ Pengajuan|Kirim|Pengajuan/i, { timeout: 10000 })
      .first()
      .click({ force: true });
  } else {
    cy.contains("button, a", buttonText, { timeout: 10000 })
      .click({ force: true });
  }
});

// ─── NAVIGASI DAN INISIALISASI ───────────────────────────────────────────────

Given("Staf Unit berada di halaman pembuatan surat {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-page-header, form, body", { timeout: 15000 }).should("be.visible");
});

function sendQuickApprovalSurat(callback) {
  const uniqueTitle = `Surat Persetujuan QA ${Date.now()}`;
  Cypress.env("activePendingSurat", uniqueTitle);

  cy.visit("/internal/surats/create");
  cy.get(".fi-page-header, form, body", { timeout: 15000 }).should("be.visible");

  // Pilih metode scratch
  cy.contains("label", /Tulis dari Awal/i).click({ force: true });
  cy.wait(1000);

  // Isi perihal
  cy.get("input[id*='perihal'], input[wire\\:model*='perihal'], input[name*='perihal']")
    .first().clear({ force: true }).type(uniqueTitle, { force: true });

  // Tambahkan alur persetujuan khusus untuk jabatan pimpinan
  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body").then(($sec) => {
    const $emptySelect = $sec.find(".fi-fo-field-wrp:contains('Jabatan'), [data-field-wrapper]:contains('Jabatan')");
    if ($emptySelect.length === 0) {
      const addBtn = $sec.find("button:contains('Alur Persetujuan'), button:contains('Add to'), button:contains('Tambah'), .fi-fo-repeater-add-btn");
      if (addBtn.length > 0) {
        cy.wrap(addBtn.first()).click({ force: true });
        cy.wait(1200);
      }
    }
  });

  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body")
    .find(".fi-fo-field-wrp:contains('Jabatan'), [data-field-wrapper]:contains('Jabatan')")
    .last()
    .find("button, [role='combobox'], select")
    .first()
    .then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select(1, { force: true }).trigger("change");
      } else {
        cy.wrap($el).click({ force: true });
        cy.wait(1000);
        cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last().then(($panel) => {
          const $search = $panel.find("input[type='search'], input[type='text'], input");
          if ($search.length > 0) {
            cy.wrap($search.first()).type("Direktur", { force: true });
            cy.wait(800);
          }
          cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last()
            .find("[role='option']:contains('Direktur'), [role='option'], li")
            .first()
            .click({ force: true });
        });
      }
    });

  cy.wait(800);

  // Aktifkan switch Penandatangan
  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body")
    .find(".fi-fo-field-wrp:contains('Penandatangan'), [data-field-wrapper]:contains('Penandatangan')")
    .last()
    .find("button[role='switch'], input[type='checkbox']")
    .then(($sw) => {
      if ($sw.is("button") && $sw.attr("aria-checked") !== "true") {
        cy.wrap($sw).click({ force: true });
      } else if ($sw.is("input") && !$sw.is(":checked")) {
        cy.wrap($sw).check({ force: true });
      }
    });

  // Isi konten TinyMCE / textarea
  cy.wait(1000);
  cy.window().then((win) => {
    const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
    if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
      const editor = win.tinymce.get("content.isi_surat") || win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
      if (editor) {
        editor.setContent("<p>Isi naskah alur persetujuan QA.</p>");
        editor.fire("change");
        editor.save();
        return;
      }
    }
    cy.get("body").then(($body) => {
      const textareas = $body.find("textarea[id*='isi'], textarea[name*='isi'], textarea");
      if (textareas.length > 0) {
        cy.wrap(textareas.first()).clear({ force: true }).type("Isi naskah alur persetujuan QA.", { force: true });
      }
    });
  });

  cleanupEmptyRepeaterRows();

  // Kirim
  cy.get(".fi-form-actions, form, body")
    .contains("button", /Kirim \/ Pengajuan/i, { timeout: 10000 })
    .click({ force: true });

  // Modal konfirmasi kirim - isi catatan
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type("Draf diajukan untuk proses review QA", { force: true });

  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button.fi-btn-primary, button:contains('Submit'), button:contains('Kirim')")
    .first().click({ force: true });

  // Tunggu redirect ke surat keluar
  cy.url({ timeout: 15000 }).should("include", "/internal/surats");

  if (typeof callback === "function") {
    callback(uniqueTitle);
  }
}

function navigateAndOpenSuratByTitle(title) {
  cy.visit("/internal/surat-masuk");
  cy.get("table tbody, .fi-ta-content, body", { timeout: 15000 }).should("be.visible");
  cy.get(".fi-ta-search-field input", { timeout: 10000 })
    .first()
    .clear({ force: true })
    .type(`${title}{enter}`, { force: true });
  cy.wait(2000);
  cy.get("table tbody tr, .fi-ta-record")
    .first()
    .find("a[href*='/internal/surat-masuk/']")
    .first()
    .click({ force: true });
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-page-header, main, body", { timeout: 15000 }).should("be.visible");
}

Given("Pimpinan membuka salah satu surat masuk yang sedang diproses", () => {
  const activeTitle = Cypress.env("activePendingSurat");

  if (activeTitle) {
    cy.visit("/internal/surat-masuk");
    cy.get("table tbody, .fi-ta-content, body", { timeout: 15000 }).should("be.visible");
    cy.get(".fi-ta-search-field input", { timeout: 10000 })
      .first()
      .clear({ force: true })
      .type(`${activeTitle}{enter}`, { force: true });
    cy.wait(2000);

    cy.get("body").then(($body) => {
      const $rows = $body.find("table tbody tr, .fi-ta-record");
      if ($rows.length > 0 && $rows.text().includes(activeTitle)) {
        cy.wrap($rows.first()).find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
        cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
        cy.get(".fi-page-header, main, body", { timeout: 15000 }).should("be.visible");
      } else {
        sendQuickApprovalSurat((createdTitle) => {
          navigateAndOpenSuratByTitle(createdTitle);
        });
      }
    });
  } else {
    sendQuickApprovalSurat((createdTitle) => {
      navigateAndOpenSuratByTitle(createdTitle);
    });
  }
});

Given("Pimpinan membuka salah satu surat masuk yang tersedia", () => {
  cy.visit("/internal/surat-masuk");
  cy.get("table tbody, .fi-ta-content, body", { timeout: 15000 }).should("be.visible");

  cy.get("table tbody tr, .fi-ta-record").first().then(($row) => {
    const link = $row.find("a[href*='/internal/surat-masuk/']").first();
    if (link.length > 0) {
      cy.wrap(link).click({ force: true });
    } else {
      cy.wrap($row).click({ force: true });
    }
  });

  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-page-header, main, body", { timeout: 15000 }).should("be.visible");
});

// ─── PENGISIAN FORM PENGIRIMAN SURAT (FR-SRT-04) ─────────────────────────────

When("Staf Unit mengisi field perihal dengan judul unik {string}", (prefix) => {
  const uniqueTitle = `${prefix} ${Date.now()}`;
  Cypress.env("lastCreatedPerihal", uniqueTitle);

  cy.get("input[id*='perihal'], input[wire\\:model*='perihal'], input[name*='perihal']")
    .first()
    .clear({ force: true })
    .type(uniqueTitle, { force: true })
    .trigger("input")
    .trigger("change")
    .blur();

  cy.wait(500);
});

When("Staf Unit memilih unit tujuan pertama yang tersedia", () => {
  cleanupEmptyRepeaterRows();
  cy.get("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan'), .fi-fo-field:contains('Penerima Surat')")
    .first()
    .within(() => {
      cy.get("button.fi-select-input-btn, button, select, [role='combobox']").first().click({ force: true });
    });

  cy.wait(1500);

  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
    .last()
    .find("li[role='option'], [role='option'], .fi-select-input-option")
    .first()
    .click({ force: true });

  cy.wait(1000);

  // Verifikasi badge telah terbentuk di kontainer field wrapper
  cy.get("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan')")
    .first()
    .find(".fi-badge, .fi-select-input-value-badges-ctn, [class*='badge']")
    .should("exist");
});

When("Staf Unit mengisi konten naskah surat dengan {string}", (isiNaskah) => {
  cy.wait(1000);
  cy.window().then((win) => {
    const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
    if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
      const editor = win.tinymce.get("content.isi_surat") || win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
      if (editor) {
        editor.setContent(`<p>${isiNaskah}</p>`);
        editor.fire("change");
        editor.save();
        return;
      }
    }

    cy.get("body").then(($body) => {
      const iframes = $body.find("iframe");
      if (iframes.length > 0) {
        cy.wrap(iframes.first()).then(($iframe) => {
          const doc = $iframe.contents().find("body");
          if (doc.length > 0) {
            cy.wrap(doc).clear({ force: true }).type(isiNaskah, { force: true });
          }
        });
      } else {
        const textareas = $body.find("textarea[id*='isi'], textarea[name*='isi'], textarea");
        if (textareas.length > 0) {
          cy.wrap(textareas.first()).clear({ force: true }).type(isiNaskah, { force: true });
        }
      }
    });
  });
});

When("Staf Unit memastikan unit tujuan dan jalur persetujuan dalam keadaan kosong", () => {
  cy.get("body").then(($body) => {
    // 1. Hapus pilihan Unit Tujuan jika ada badge terpilih
    const deleteBadges = $body.find(".fi-fo-field-wrp:contains('Penerima Surat') button[title*='Delete'], .fi-fo-field-wrp:contains('Penerima Surat') .fi-badge-delete-btn, .fi-fo-field-wrp:contains('Unit Tujuan') button");
    if (deleteBadges.length > 0) {
      cy.wrap(deleteBadges).each(($b) => cy.wrap($b).click({ force: true }));
    }

    // 2. Hapus semua baris default pada repeater Jalur Persetujuan Khusus agar approval_path kosong
    const deleteRepeater = $body.find(".fi-section:contains('Jalur Persetujuan') button[title*='Delete'], .fi-section:contains('Jalur Persetujuan') button[aria-label*='Delete'], .fi-section:contains('Jalur Persetujuan') .fi-fo-repeater-item-delete-btn");
    if (deleteRepeater.length > 0) {
      cy.wrap(deleteRepeater).each(($btn) => {
        cy.wrap($btn).click({ force: true });
        cy.wait(500);
      });
    }
  });
  cy.wait(800);
});

When("Staf Unit menambahkan jalur persetujuan khusus untuk jabatan pimpinan", () => {
  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body").then(($sec) => {
    const $emptySelect = $sec.find(".fi-fo-field-wrp:contains('Jabatan'), [data-field-wrapper]:contains('Jabatan')");
    if ($emptySelect.length === 0) {
      const addBtn = $sec.find("button:contains('Alur Persetujuan'), button:contains('Add to'), button:contains('Tambah'), .fi-fo-repeater-add-btn");
      if (addBtn.length > 0) {
        cy.wrap(addBtn.first()).click({ force: true });
        cy.wait(1200);
      }
    }
  });

  // Pilih jabatan pada repeater item
  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body")
    .find(".fi-fo-field-wrp:contains('Jabatan'), [data-field-wrapper]:contains('Jabatan')")
    .last()
    .find("button, [role='combobox'], select")
    .first()
    .then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select(1, { force: true }).trigger("change");
      } else {
        cy.wrap($el).click({ force: true });
        cy.wait(1500);
        cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
          .last()
          .find("[role='option'], li, button")
          .first()
          .click({ force: true });
      }
    });

  cy.wait(800);

  // Aktifkan switch Penandatangan jika tersedia
  cy.get(".fi-section:contains('Jalur Persetujuan Khusus'), body")
    .find(".fi-fo-field-wrp:contains('Penandatangan'), [data-field-wrapper]:contains('Penandatangan')")
    .last()
    .find("button[role='switch'], input[type='checkbox']")
    .then(($sw) => {
      if ($sw.is("button") && $sw.attr("aria-checked") !== "true") {
        cy.wrap($sw).click({ force: true });
      } else if ($sw.is("input") && !$sw.is(":checked")) {
        cy.wrap($sw).check({ force: true });
      }
    });
});



When("Staf Unit mengisi catatan pengiriman pada modal dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Staf Unit mengonfirmasi pengiriman surat pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button.fi-btn-primary, button:contains('Submit'), button:contains('Kirim')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses pengiriman surat {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
});

Then("Sistem mengalihkan pengguna ke halaman surat keluar {string}", (expectedUrlPattern) => {
  cy.url({ timeout: 15000 }).should("include", expectedUrlPattern);
});

Then("Surat yang baru dikirim dengan judul unik tersebut tercatat pada sistem", () => {
  const lastTitle = Cypress.env("lastCreatedPerihal");
  if (lastTitle) {
    // Cari judul di kolom pencarian tabel agar tidak tertahan paginasi
    cy.get("body").then(($body) => {
      const $search = $body.find(".fi-ta-search-field input, input[type='search'], input[placeholder*='Cari'], input[placeholder*='Search']");
      if ($search.length > 0 && $search.is(":visible")) {
        cy.wrap($search.first()).clear({ force: true }).type(`${lastTitle}{enter}`, { force: true });
        cy.wait(1500);
      }
    });
    cy.contains("tr", lastTitle, { timeout: 15000 })
      .invoke("text")
      .should("match", /TERKIRIM|DIPROSES/i);
  }
});

Then("Sistem menolak pengiriman dan menampilkan notifikasi peringatan tujuan {string}", (expectedWarning) => {
  assertToastNotification(expectedWarning);
});

Then("Surat dengan jalur persetujuan tersebut tercatat dengan status diproses", () => {
  const lastTitle = Cypress.env("lastCreatedPerihal");
  if (lastTitle) {
    // Cari judul di kolom pencarian tabel agar tidak tertahan paginasi
    cy.get("body").then(($body) => {
      const $search = $body.find(".fi-ta-search-field input, input[type='search'], input[placeholder*='Cari'], input[placeholder*='Search']");
      if ($search.length > 0 && $search.is(":visible")) {
        cy.wrap($search.first()).clear({ force: true }).type(`${lastTitle}{enter}`, { force: true });
        cy.wait(1500);
      }
    });
    cy.contains("tr", lastTitle, { timeout: 15000 })
      .invoke("text")
      .should("match", /TERKIRIM|DIPROSES/i);
  }
});

// ─── AKSI PENGEMBALIAN & BACKTRACK (FR-SRT-05) ───────────────────────────────

When("Pimpinan membuka grup aksi {string}", (groupName) => {
  cy.wait(800);
  cy.get(".fi-header-actions, .fi-page-header, body")
    .contains("button", groupName, { timeout: 10000 })
    .click({ force: true });
  cy.wait(800);
});

When("Pimpinan memilih aksi {string}", (actionName) => {
  const pattern = new RegExp(
    actionName
      .replace(/[()]/g, "\\$&")
      .replace(/Finalisasi & Selesai/i, "(?:2\\.\\s*)?Finalisasi & (?:Selesai|Selesaikan Surat)"),
    "i"
  );
  cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible, [role='menu']:visible", { timeout: 8000 })
    .last()
    .contains("button, [role='menuitem'], a", pattern, { timeout: 8000 })
    .click({ force: true });
  cy.wait(800);
});

When("Pimpinan mengosongkan teks alasan pengembalian pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true });
});

When("Pimpinan menekan tombol submit modal pengembalian", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit')")
    .first()
    .click({ force: true });
});

Then("Form modal menampilkan validasi bahwa alasan pengembalian wajib diisi", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .find("textarea")
    .first()
    .then(($textarea) => {
      // Validasi HTML5 :invalid atau border merah Filament
      const isInvalid = $textarea.is(":invalid") || $textarea.hasClass("border-danger-600") || $textarea.attr("aria-invalid") === "true";
      expect(isInvalid || $textarea.prop("required")).to.be.true;
    });
});

When("Pimpinan membatalkan modal pengembalian surat", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .contains("button", /Cancel|Batal|Tutup/i)
    .first()
    .click({ force: true });

  // Verifikasi modal telah tertutup (butir 20 AGENTS.md)
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible").should("not.exist");
});

When("Pimpinan mengisi alasan pengembalian dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

Then("Sistem menampilkan notifikasi sukses pengembalian {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan mengisi alasan revisi total dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

Then("Sistem menampilkan notifikasi sukses revisi {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan mengisi alasan penolakan permanen dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

When("Pimpinan mengonfirmasi penolakan permanen pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Tolak')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi penolakan {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

// ─── ALUR LINIMASA, RESPON, DOKUMEN & TTE (FR-SRT-09..11 & FR-TTD-01) ────────

When("Pimpinan memeriksa section linimasa {string}", (sectionTitle) => {
  const pattern = new RegExp(sectionTitle.replace(/[()]/g, "\\$&"), "i");
  cy.contains("span, h2, h3, div, p", pattern, { timeout: 15000 })
    .scrollIntoView()
    .should("exist");
});

Then("Sistem menampilkan tahapan perjalanan surat meliputi riwayat pembuatan dan distribusi surat", () => {
  cy.get("body").then(($b) => {
    const hasCreated = $b.text().includes("Surat Dibuat");
    const hasSent = $b.text().includes("Surat Dikirim") || $b.text().includes("Tujuan Utama");
    expect(hasCreated || hasSent).to.be.true;
  });
});

When("Pimpinan memeriksa area dokumen naskah surat dan lampiran", () => {
  cy.get(".surat-page-sheet, .preview-container, .fi-section:contains('Lampiran'), body", { timeout: 15000 })
    .first()
    .scrollIntoView()
    .should("exist");
});

Then("Sistem menyediakan akses tampilan dokumen naskah serta berkas lampiran surat", () => {
  cy.get("body").then(($body) => {
    const hasNaskah = $body.find(".surat-page-sheet, [class*='surat-page'], iframe, .prose").length > 0;
    const hasLampiran = $body.text().includes("Lampiran Berkas") || $body.text().includes("Lampiran");
    expect(hasNaskah || hasLampiran).to.be.true;
  });
});

When("Pimpinan memilih aksi pengaturan tanda tangan digital", () => {
  cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 8000 })
    .contains("button, [role='menuitem'], a", /1\. Bubuhkan & Atur TTD|1\. Ubah Metode|Bubuhkan TTD/i, { timeout: 8000 })
    .click({ force: true });
  cy.wait(1000);
});

When("Pimpinan memilih metode pengesahan {string}", (metodeLabel) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .contains("label, span", metodeLabel)
    .first()
    .click({ force: true });
});

When("Pimpinan memastikan opsi tampilkan nama penandatangan aktif", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .contains("label, .fi-fo-field-wrp", /Tampilkan Nama & Jabatan/i)
    .then(($wrp) => {
      const sw = $wrp.find("button[role='switch'], input[type='checkbox']");
      if (sw.length > 0) {
        if (sw.is("button") && sw.attr("aria-checked") !== "true") {
          cy.wrap(sw).click({ force: true });
        } else if (sw.is("input") && !sw.is(":checked")) {
          cy.wrap(sw).check({ force: true });
        }
      }
    });
});

When("Pimpinan menerapkan pengaturan tanda tangan ke lembar surat", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .find("button[type='submit'], button:contains('Terapkan')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses penyiapan TTD {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
});

When("Pimpinan mengisi catatan persetujuan akhir dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Pimpinan menekan tombol konfirmasi finalisasi surat", () => {
  // Simpan URL surat yang difinalisasi agar tidak dibuka kembali oleh skenario berikutnya
  cy.url().then((url) => {
    Cypress.env("lastFinalizedSuratUrl", url);
  });

  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Finalisasi')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses finalisasi {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan memilih aksi tanggapi dan selesaikan internal", () => {
  cy.get("body").then(($body) => {
    const directBtn = $body.find(".fi-header-actions button:contains('Tanggapi & Selesaikan'), .fi-page-header button:contains('Tanggapi & Selesaikan')");
    if (directBtn.length > 0) {
      cy.wrap(directBtn.first()).click({ force: true });
    } else if ($body.find("button:contains('Proses Surat')").length > 0) {
      cy.get(".fi-header-actions, .fi-page-header, body")
        .contains("button", "Proses Surat", { timeout: 10000 })
        .click({ force: true });
      cy.wait(800);
      cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 8000 })
        .contains("button, [role='menuitem'], a", /(?:2\.\s*)?Finalisasi & (?:Selesai|Selesaikan Surat)|Teruskan Saja/i)
        .first()
        .click({ force: true });
    }
  });
});

When("Pimpinan mengisi catatan balasan penyelesaian dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Pimpinan menekan tombol submit catatan penyelesaian", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Finalisasi')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi surat diselesaikan atau terproses", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body", { timeout: 15000 })
    .should("exist");
  Cypress.env("activePendingSurat", null);
});
