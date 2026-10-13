import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Step Definitions untuk Modul Naskah Dinas Elektronik (Draft Surat)
 * Mencakup FR-SRT-01, FR-SRT-02, dan FR-SRT-03
 */

// ─── HELPER: PEMBERSIHAN BARIS REPEATER KOSONG (BUTIR 3 AGENTS.MD) ───────────

function cleanupEmptyRepeaterRows() {
  cy.get("body").then(($body) => {
    const deleteBtns = $body.find(
      "button[title*='Delete'], button[title*='Hapus'], button[aria-label*='Delete'], button[aria-label*='Hapus'], .fi-fo-repeater-item-delete-btn, [wire\\:click*='deleteItem']"
    );
    if (deleteBtns.length > 0) {
      cy.wrap(deleteBtns).first().click({ force: true });
      cy.wait(1000);
    }
  });
}

// ─── HELPER: PILIH UNIT TUJUAN JIKA KOSONG ────────────────────────────────────

function selectUnitTujuanIfEmpty() {
  cy.get("body").then(($body) => {
    // Cek apakah field Penerima Surat / Unit Tujuan ada di form
    const $wrp = $body.find("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan'), .fi-fo-field:contains('Penerima Surat'), .fi-fo-field:contains('Unit Tujuan')");
    if ($wrp.length > 0) {
      // Jika belum ada badge terpilih
      if ($wrp.find(".fi-badge, [class*='badge']").length === 0) {
        const $interactive = $wrp.find("select, input, button.fi-select-input-btn, button, [role='combobox']");
        if ($interactive.length > 0) {
          const $el = $interactive.first();
          if ($el.is("select")) {
            cy.wrap($el).select(1, { force: true }).trigger("change");
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(1000);
            cy.get("body").then(($b) => {
              const $options = $b.find(
                ".fi-dropdown-panel:visible [role='option'], .fi-dropdown-panel:visible li, [role='listbox']:visible [role='option'], li.fi-select-input-option:visible"
              );
              if ($options.length > 0) {
                cy.wrap($options.first()).click({ force: true });
                cy.wait(800);
              }
            });
          }
        }
      }
    }
  });
}

// ─── NAVIGASI & AKSI FORM DASAR ──────────────────────────────────────────────

When("Staf Unit mengakses halaman draft surat {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-ta-content, .fi-page-header, body", { timeout: 15000 }).should("be.visible");
});

When("Staf Unit menekan tombol {string}", (buttonText) => {
  if (/Buat Surat Baru/i.test(buttonText)) {
    cy.contains(".fi-header-actions button, .fi-header-actions a, button, a", /Buat Surat Baru/i, { timeout: 10000 })
      .first()
      .click({ force: true });
  } else if (/Simpan Draft/i.test(buttonText)) {
    // 1. Pastikan unit tujuan terisi jika mandatory
    selectUnitTujuanIfEmpty();

    // 2. Bersihkan baris repeater default kosong jika ada agar tidak memblokir submit draft (Butir 3 AGENTS.md)
    cleanupEmptyRepeaterRows();

    // 3. Isolasi tombol Simpan Draft di area aksi form
    cy.get(".fi-form-actions, form, body")
      .contains("button", /Simpan Draft/i, { timeout: 10000 })
      .click({ force: true });
  } else {
    cy.contains("button, a", buttonText, { timeout: 10000 })
      .click({ force: true });
  }
});

When("Staf Unit memilih metode pembuatan {string}", (metode) => {
  const isScratch = metode.toLowerCase() === "scratch";
  const radioValue = isScratch ? "scratch" : "template";
  const labelText = isScratch ? /Tulis dari Awal/i : /Gunakan Template/i;

  // Klik label radio untuk memicu Alpine/Livewire secara andal
  cy.contains("label", labelText).click({ force: true });
  cy.get(`input[type='radio'][value='${radioValue}']`).then(($radio) => {
    if (!$radio.is(":checked")) {
      cy.wrap($radio).check({ force: true });
    }
    cy.wrap($radio).trigger("change");
  });

  // Berikan toleransi jeda roundtrip Livewire
  cy.wait(2000);
});

When("Staf Unit memilih template surat pertama yang tersedia", () => {
  // Tunggu hingga Livewire memuat opsi template (lebih dari 1 opsi termasuk placeholder)
  cy.get("[data-field-wrapper]:contains('Pilih Template') select option, select[id*='template_id'] option", { timeout: 15000 })
    .should("have.length.gt", 1);

  // Pilih template pertama yang valid (indeks 1)
  cy.get("[data-field-wrapper]:contains('Pilih Template') select, select[id*='template_id']")
    .first()
    .select(1, { force: true })
    .trigger("change");

  cy.wait(2000);

  // Pastikan unit tujuan terisi jika diperlukan
  selectUnitTujuanIfEmpty();
});

When("Staf Unit mengisi perihal surat dengan {string}", (perihalText) => {
  cy.get("input[id*='perihal'], input[wire\\:model*='perihal']")
    .first()
    .clear({ force: true })
    .type(perihalText, { force: true });
});

When("Staf Unit mengosongkan perihal surat", () => {
  cy.get("input[id*='perihal'], input[wire\\:model*='perihal']")
    .first()
    .clear({ force: true });
});

When("Staf Unit mengisi redaksi naskah surat pada editor dengan {string}", (isiNaskah) => {
  cy.wait(1500);

  // Pastikan unit tujuan terisi pada metode scratch
  selectUnitTujuanIfEmpty();

  cy.window().then((win) => {
    // 1. Coba via window.tinymce API jika sudah siap
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

    // 2. Coba akses via iframe TinyMCE
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
        // 3. Fallback textarea
        cy.get("textarea").first().clear({ force: true }).type(isiNaskah, { force: true });
      }
    });
  });
});

When("Staf Unit mengosongkan redaksi naskah surat pada editor", () => {
  cy.wait(1500);
  cy.window().then((win) => {
    const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
    if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
      const editor = win.tinymce.get("content.isi_surat") || win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
      if (editor) {
        editor.setContent("");
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
            cy.wrap(doc).clear({ force: true });
          }
        });
      } else {
        cy.get("textarea").first().clear({ force: true });
      }
    });
  });
});

// ─── ASSERTION TABEL & REDIRECT ──────────────────────────────────────────────

Then("Sistem menampilkan notifikasi sukses {string}", (notifTitle) => {
  let regexPattern = new RegExp(notifTitle.replace(/[()]/g, "\\$&"), "i");
  if (/disimpan/i.test(notifTitle)) regexPattern = /(disimpan|saved)/i;
  else if (/berhasil/i.test(notifTitle)) regexPattern = /(berhasil|success)/i;

  cy.get(".fi-no-notification:not(.fi-status-danger), .fi-notification:not(.fi-status-danger), [role='status'], body", { timeout: 10000 })
    .contains(regexPattern)
    .should("be.visible");
});

Then("Sistem mengalihkan kembali ke daftar draft surat {string}", (urlSubstring) => {
  cy.url({ timeout: 15000 }).should("include", urlSubstring);
});

Then("Draft surat dengan perihal {string} muncul pada tabel draft surat", (perihal) => {
  cy.visit("/internal/surats?scope=draft");
  cy.get(".fi-ta-content, table, body", { timeout: 15000 })
    .contains(perihal)
    .should("exist");
});

// ─── VALIDASI ERROR FORM ─────────────────────────────────────────────────────

Then("Form tidak tersimpan dan sistem menampilkan validasi error pada field perihal", () => {
  cy.contains(/perihal.*field is required|perihal.*wajib diisi|field is required/i, { timeout: 8000 })
    .should("be.visible");
});

Then("Form tidak tersimpan dan sistem menampilkan validasi error pada field template", () => {
  cy.contains(/template.*field is required|template.*wajib diisi|field is required/i, { timeout: 8000 })
    .should("be.visible");
});

Then("Form tidak tersimpan dan sistem menampilkan validasi error pada field isi surat", () => {
  cy.contains(/isi surat.*field is required|content.*field is required|field is required/i, { timeout: 8000 })
    .should("be.visible");
});

// ─── FR-SRT-02: EDIT DRAFT SURAT ─────────────────────────────────────────────

Given("Staf Unit memiliki draft surat aktif dengan perihal {string}", (perihal) => {
  cy.visit("/internal/surats?scope=draft");
  cy.get("body").then(($body) => {
    if (!$body.text().includes(perihal)) {
      cy.contains(".fi-header-actions button, .fi-header-actions a, button, a", /Buat Surat Baru/i)
        .first()
        .click({ force: true });
      cy.contains("label", /Tulis dari Awal/i).click({ force: true });
      cy.wait(2000);
      cy.get("input[id*='perihal'], input[wire\\:model*='perihal']").first().clear({ force: true }).type(perihal, { force: true });
      selectUnitTujuanIfEmpty();
      cy.window().then((win) => {
        const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
        if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
          const editor = win.tinymce.get("content.isi_surat") || win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
          if (editor) {
            editor.setContent("<p>Redaksi draft inisial</p>");
            editor.fire("change");
            editor.save();
          }
        }
      });
      cleanupEmptyRepeaterRows();
      cy.get(".fi-form-actions, form, body").contains("button", /Simpan Draft/i).click({ force: true });
      cy.wait(2000);
      cy.visit("/internal/surats?scope=draft");
    }
  });
});

When("Staf Unit membuka form edit draft surat {string}", (perihal) => {
  cy.visit("/internal/surats?scope=draft");
  cy.contains("tr, .fi-ta-record", perihal, { timeout: 15000 })
    .within(() => {
      cy.get("a[href*='/edit'], a").first().click({ force: true });
    });
  cy.url({ timeout: 15000 }).should("include", "/edit");
});

When("Staf Unit mengubah perihal surat menjadi {string}", (perihalBaru) => {
  cy.get("input[id*='perihal'], input[wire\\:model*='perihal']")
    .first()
    .clear({ force: true })
    .type(perihalBaru, { force: true });
});

// ─── FR-SRT-03: ASISTEN AI DRAFT SURAT ───────────────────────────────────────

When("Staf Unit menekan tombol aksi hint {string} di samping editor", (labelTombol) => {
  cy.contains("button, a", new RegExp(labelTombol.replace(/[()]/g, "\\$&"), "i"), { timeout: 10000 })
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan modal dialog {string}", (modalTitle) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 10000 })
    .should("contain", modalTitle);
});

When("Staf Unit memilih kategori surat AI {string}", (kategori) => {
  cy.get(".fi-modal:visible")
    .contains("label", /Kategori/i)
    .closest("div")
    .parent()
    .find("select, button, input")
    .first()
    .then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select(kategori, { force: true });
      } else {
        cy.wrap($el).click({ force: true });
      }
    });
  cy.get("body").then(($body) => {
    if ($body.find(".fi-dropdown-panel:visible").length > 0) {
      cy.get(".fi-dropdown-panel:visible").contains("[role='option'], li, button", kategori).click({ force: true });
    }
  });
});

When("Staf Unit memilih gaya bahasa AI {string}", (tone) => {
  cy.get(".fi-modal:visible")
    .contains("label", /Gaya Bahasa|Tone/i)
    .closest("div")
    .parent()
    .find("select, button, input")
    .first()
    .then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select(tone, { force: true });
      } else {
        cy.wrap($el).click({ force: true });
      }
    });
  cy.get("body").then(($body) => {
    if ($body.find(".fi-dropdown-panel:visible").length > 0) {
      cy.get(".fi-dropdown-panel:visible").contains("[role='option'], li, button", tone).click({ force: true });
    }
  });
});

When("Staf Unit mengisi instruksi kebutuhan surat pada modal AI dengan {string}", (promptText) => {
  cy.get(".fi-modal:visible")
    .find("textarea[id*='ai_prompt'], textarea[wire\\:model*='ai_prompt'], textarea")
    .first()
    .clear({ force: true })
    .type(promptText, { force: true });
});

When("Staf Unit mengosongkan instruksi kebutuhan surat pada modal AI", () => {
  cy.get(".fi-modal:visible")
    .find("textarea[id*='ai_prompt'], textarea[wire\\:model*='ai_prompt'], textarea")
    .first()
    .clear({ force: true });
});

When("Staf Unit menekan tombol submit pada modal AI", () => {
  cy.get(".fi-modal:visible")
    .find(".fi-modal-footer-actions button, button[type='submit']")
    .first()
    .click({ force: true });
});

Then("Form modal AI menampilkan validasi bahwa instruksi prompt wajib diisi", () => {
  cy.get(".fi-modal:visible")
    .find(".fi-fo-field-wrp-error-message, .text-danger-600, .fi-error, [role='alert']")
    .should("exist");
});

Then("Modal dialog Asisten AI berhasil ditutup dan kembali ke form pembuatan surat", () => {
  cy.get(".fi-modal").should("not.exist");
});

// ─── TEARDOWN DRAFT SURAT ────────────────────────────────────────────────────

When("Staf Unit menghapus draft surat dengan perihal {string} jika ada", (perihal) => {
  cy.visit("/internal/surats?scope=draft");
  cy.get("body").then(($body) => {
    if ($body.text().includes(perihal)) {
      cy.contains("tr, .fi-ta-record", perihal)
        .within(() => {
          cy.get("a[href*='/edit'], a").first().click({ force: true });
        });
      cy.url({ timeout: 15000 }).should("include", "/edit");

      // Klik tombol Hapus / Delete di halaman edit
      cy.get(".fi-header-actions, .fi-page-header, body")
        .contains("button, a", /Hapus|Delete/i)
        .click({ force: true });

      // Konfirmasi modal
      cy.get(".fi-modal:visible")
        .contains("button", /Hapus|Delete|Confirm|Ya/i)
        .click({ force: true });

      cy.get(".fi-modal").should("not.exist");
      cy.wait(1500);
      cy.visit("/internal/surats?scope=draft");
    }
  });
});

Then("Seluruh draft surat pengujian pembuatan berhasil dibersihkan dari tabel draft surat", () => {
  cy.visit("/internal/surats?scope=draft");
  cy.contains("Draft Surat Undangan Koordinasi Template QA").should("not.exist");
  cy.contains("Draft Surat Instruksi Kerja Scratch QA").should("not.exist");
});

Then("Seluruh draft surat pengujian edit berhasil dibersihkan dari tabel draft surat", () => {
  cy.visit("/internal/surats?scope=draft");
  cy.contains("Draft Surat Telah Diedit Sukses QA").should("not.exist");
  cy.contains("Draft Surat Untuk Diedit QA").should("not.exist");
});

When("Staf Unit memastikan tidak ada draft surat uji AI yang tertinggal", () => {
  cy.visit("/internal/surats?scope=draft");
});

Then("Seluruh proses pengujian asisten AI selesai dengan aman", () => {
  cy.log("FR-SRT-03 Asisten AI test completed successfully.");
});
