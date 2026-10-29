import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── HELPER: PASTIKAN FORMAT PENOMORAN AKTIF TERSEDIA ────────────────────────

function ensureActiveFormatExists() {
  cy.visit("/internal/format-nomor-surats");
  cy.get(".fi-ta-content, body", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);

  cy.get("body").then(($body) => {
    const hasRows = $body.find("tbody tr:not(.fi-ta-empty-state-row)").length > 0;
    if (!hasRows) {
      cy.log("Format nomor belum ada, membuat format standar aktif...");
      cy.visit("/internal/format-nomor-surats/create");
      cy.get("body").should("be.visible");
      cy.get('input[id*="nama_format"]').first().type("Format Standar Institusi QA", { force: true });
      cy.get('input[id*="format_penomoran"]').first().type("{NOMOR}/UNIK/{KODE_UNIT}/{BULAN_ROMAWI}/{TAHUN}", { parseSpecialCharSequences: false, force: true });
      cy.get(".fi-form-actions, form, body").contains("button", /Buat|Simpan|Create/i).first().click({ force: true });
      cy.wait(1500);
    }
  });
}

// ─── HELPER: BUKA SURAT KELUAR MILIK UNIT SENDIRI UNTUK PENOMORAN ─────────────

function openOrCreateSuratForPenomoran() {
  ensureActiveFormatExists();

  const cachedUrl = Cypress.env("penomoranLetterUrl");
  if (cachedUrl) {
    cy.visit(cachedUrl);
    cy.get(".fi-page-header, body", { timeout: 15000 }).should("be.visible");
    return;
  }

  cy.visit("/internal/surats?scope=keluar");
  cy.get(".fi-ta-content, body", { timeout: 15000 }).should("be.visible");
  cy.wait(1000);

  // Cari surat dinas internal yang dibuat sendiri oleh unit (bukan delegasi disposisi dari mahasiswa)
  cy.get('input[type="search"], input[placeholder*="Search"]').first().clear({ force: true }).type("Koordinasi", { force: true });
  cy.wait(1500);

  cy.get("body").then(($body) => {
    const $rows = $body.find("tbody tr:not(.fi-ta-empty-state-row)");
    if ($rows.length > 0) {
      const $link = $rows.first().find("a[href*='/internal/surat-masuk/'], a[href*='/internal/surats/'], a");
      if ($link.length > 0) {
        cy.wrap($link.first()).click({ force: true });
      } else {
        cy.wrap($rows.first().find("td").first()).click({ force: true });
      }
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/internal/surat-masuk/")) {
          Cypress.env("penomoranLetterUrl", url);
        }
      });
    } else {
      // Fallback: Jika belum ada surat koordinasi, buat surat keluar internal baru secara cepat
      cy.log("Membuat surat keluar internal baru untuk penomoran...");
      cy.visit("/internal/surats/create");
      cy.get("body").should("be.visible");
      cy.contains("label", /Tulis dari Awal/i, { timeout: 10000 }).click({ force: true });

      const uniquePerihal = "Surat Koordinasi Langsung QA - " + Date.now();
      cy.get('input[id*="perihal"]').first().type(uniquePerihal, { force: true });

      // Pilih Unit Tujuan
      cy.get("[data-field-wrapper]:contains('Unit Tujuan'), [data-field-wrapper]:contains('Penerima Surat')")
        .find("select, button, [role='combobox']").first().then(($el) => {
          if ($el.is("select")) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(500);
            cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last().find("[role='option'], li").first().click({ force: true });
          }
        });

      // Isi editor
      cy.wait(1000);
      cy.window().then((win) => {
        if (win.tinymce && win.tinymce.activeEditor) {
          win.tinymce.activeEditor.setContent("<p>Isi naskah surat dinas koordinasi QA.</p>");
        }
      });

      // Kirim surat
      cy.get(".fi-form-actions, form, body").contains("button", /Kirim \/ Pengajuan/i, { timeout: 10000 }).click({ force: true });
      cy.wait(800);
      cy.get(".fi-modal-window:visible, [role='dialog']:visible").find("button[type='submit']").first().click({ force: true });
      cy.wait(2000);

      cy.visit("/internal/surats?scope=keluar");
      cy.get("tbody tr:not(.fi-ta-empty-state-row) a").first().click({ force: true });
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/internal/surat-masuk/")) {
          Cypress.env("penomoranLetterUrl", url);
        }
      });
    }
  });

  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-page-header, body").should("be.visible");
}

// ─── STEP DEFINITIONS PENOMORAN ──────────────────────────────────────────────

Given("Staf Unit membuka detail surat keluar untuk penomoran", () => {
  openOrCreateSuratForPenomoran();
});

When("Staf Unit membuka menu dropdown {string} dan memilih aksi {string}", (groupLabel, actionLabel) => {
  cy.wait(800);
  cy.get("body").then(($body) => {
    const $groupBtn = $body.find(`button:contains('${groupLabel}'), .fi-btn:contains('${groupLabel}')`);
    if ($groupBtn.length > 0) {
      cy.wrap($groupBtn.first()).click({ force: true });
      cy.wait(600);
      cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 8000 })
        .last()
        .contains("button, a, span", new RegExp(actionLabel, "i"))
        .click({ force: true });
    } else {
      cy.contains("button, a", new RegExp(actionLabel, "i"), { timeout: 8000 })
        .click({ force: true });
    }
  });
});

Then("Sistem menampilkan modal {string}", (modalHeading) => {
  cy.contains(".fi-modal-window:visible", new RegExp(modalHeading, "i"), { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit memilih format penomoran aktif", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($modal) => {
    const $selectWrp = $modal.find(".fi-fo-field-wrp:contains('Format Penomoran'), [data-field-wrapper]:contains('Format Penomoran')");
    if ($selectWrp.length > 0) {
      const $input = $selectWrp.find("select, button, [role='combobox']").first();
      if ($input.is("select")) {
        cy.wrap($input).select(1, { force: true });
      } else {
        cy.wrap($input).click({ force: true });
        cy.wait(600);
        cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last().then(($panel) => {
          const $options = $panel.find("[role='option'], li");
          if ($options.length > 0) {
            cy.wrap($options.first()).click({ force: true });
          }
        });
      }
    }
  });
  cy.wait(500);
});

When("Staf Unit mengaktifkan toggle sisipan manual dengan nomor {string}", (nomorSisipan) => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($modal) => {
    const $toggle = $modal.find("button[role='switch'], input[type='checkbox'][id*='is_manual']");
    if ($toggle.length > 0) {
      if ($toggle.is("button") && $toggle.attr("aria-checked") !== "true") {
        cy.wrap($toggle.first()).click({ force: true });
      } else if ($toggle.is("input") && !$toggle.is(":checked")) {
        cy.wrap($toggle.first()).check({ force: true });
      }
    } else {
      cy.wrap($modal).contains("label", /Sisipan Manual/i).parent().find("button[role='switch'], input[type='checkbox']").click({ force: true });
    }
  });

  cy.wait(800);
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .find('input[id*="nomor_part"]')
    .should("be.visible")
    .clear({ force: true })
    .type(nomorSisipan, { force: true })
    .trigger("input")
    .trigger("change")
    .blur();
  cy.wait(500);
});

When("Staf Unit memastikan checkbox naikkan counter tidak dicentang", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($modal) => {
    const $cb = $modal.find('input[type="checkbox"][id*="increment_counter"]');
    if ($cb.length > 0 && $cb.is(":checked")) {
      cy.wrap($cb).uncheck({ force: true });
    }
  });
});

When("Staf Unit mengaktifkan mode manual dan mengosongkan teks nomor surat final", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($modal) => {
    const $toggle = $modal.find("button[role='switch'], input[type='checkbox'][id*='is_manual']");
    if ($toggle.length > 0 && ($toggle.attr("aria-checked") !== "true" && !$toggle.is(":checked"))) {
      cy.wrap($toggle.first()).click({ force: true });
    }
  });
  cy.wait(800);
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .find('input[id*="nomor_surat_preview"]')
    .should("not.be.disabled")
    .clear({ force: true })
    .trigger("input")
    .trigger("change")
    .blur();
});

When("Staf Unit memilih tanggal surat mundur ke tanggal lampau", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .find('input[id*="tanggal_surat"]')
    .clear({ force: true })
    .type("2026-08-01", { force: true })
    .trigger("input")
    .trigger("change")
    .blur();

  cy.wait(1500); // Livewire round-trip render alasan_backdate
});

When("Staf Unit mengisi alasan backdate {string}", (alasan) => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .find('textarea[id*="alasan_backdate"]', { timeout: 10000 })
    .should("be.visible")
    .clear({ force: true })
    .type(alasan, { force: true })
    .trigger("input")
    .trigger("change")
    .blur();
});

When("Staf Unit mengosongkan field alasan backdate", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .find('textarea[id*="alasan_backdate"]', { timeout: 10000 })
    .should("be.visible")
    .clear({ force: true })
    .trigger("input")
    .trigger("change")
    .blur();
});

When("Staf Unit menekan tombol konfirmasi nomor surat pada modal", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .contains("button", "Submit")
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses penetapan nomor surat", () => {
  cy.get(".fi-notification, .fi-no-notification, [role='status'], [role='alert'], body", { timeout: 15000 })
    .should("be.visible")
    .and("contain.text", "Nomor");

  // Pastikan modal tertutup (Rule 20)
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .should("not.exist");
});

Then("Halaman detail menampilkan nomor surat resmi yang telah terpasang", () => {
  cy.contains("p", /Nomor Surat/i, { timeout: 15000 })
    .parent()
    .find("p.font-mono, [class*='font-mono']")
    .should("not.have.text", "-")
    .and("not.be.empty");
});

Then("Halaman detail menampilkan nomor surat yang memuat sisipan manual {string}", (nomorSisipan) => {
  cy.contains("p", /Nomor Surat/i, { timeout: 15000 })
    .parent()
    .find("p.font-mono, [class*='font-mono']")
    .should("contain.text", nomorSisipan);
});

Then("Sistem menolak penetapan nomor dan modal tetap menampilkan pesan validasi error", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .should("be.visible");

  cy.get("body").should(($b) => {
    const hasError =
      $b.find(".fi-fo-field-wrp-error-message, .text-danger-600, p[class*='danger'], [class*='text-danger']").length > 0 ||
      $b.find(":invalid").length > 0;
    expect(hasError).to.be.true;
  });

  // Teardown modal agar tidak menutupi skenario berikutnya
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($m) => {
    const $cancel = $m.find("button:contains('Cancel'), button:contains('Batal'), button[aria-label='Close']");
    if ($cancel.length > 0) {
      cy.wrap($cancel.first()).click({ force: true });
    } else {
      cy.get("body").type("{esc}");
    }
  });
  cy.wait(500);
});

Then("Sistem menolak penetapan nomor dan menampilkan validasi error alasan backdate wajib diisi", () => {
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i)
    .should("be.visible");

  cy.get("body").should(($b) => {
    const hasBackdateError =
      $b.find(".fi-fo-field-wrp:contains('Alasan Backdate') .fi-fo-field-wrp-error-message, .fi-fo-field-wrp:contains('Alasan Backdate') [class*='danger']").length > 0 ||
      $b.find('textarea[id*="alasan_backdate"]:invalid').length > 0;
    expect(hasBackdateError).to.be.true;
  });

  // Teardown modal agar tidak menutupi skenario berikutnya
  cy.contains(".fi-modal-window:visible", /Penomoran Surat/i).then(($m) => {
    const $cancel = $m.find("button:contains('Cancel'), button:contains('Batal'), button[aria-label='Close']");
    if ($cancel.length > 0) {
      cy.wrap($cancel.first()).click({ force: true });
    } else {
      cy.get("body").type("{esc}");
    }
  });
  cy.wait(500);
});
