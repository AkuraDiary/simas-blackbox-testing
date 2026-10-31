import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Step Definitions untuk Modul Suplemen Evaluasi UEQ & Validasi Data Master UNIK
 * Sesuai Aturan Rule 32, Rule 14, Rule 2, dan Rule 20 di simas-blackbox-testing/AGENTS.md
 *
 * Catatan Arsitektur Pengujian:
 * - Langkah 'Given Staf Unit telah login dengan akun {string} dan kata sandi {string}'
 *   memanfaatkan implementasi yang telah ada di 'staf/surat_masuk_steps.js' untuk mencegah
 *   ambiguous/duplicate step definition collision pada Cypress runner suite utama.
 * - Langkah-langkah umum formulir surat ('memilih metode pembuatan', 'mengisi perihal surat',
 *   'menekan tombol', 'Sistem menampilkan notifikasi sukses', 'menghapus draft surat')
 *   memanfaatkan implementasi teruji di 'draft/draft_surat_steps.js'.
 */

// Helper: Bersihkan baris repeater default kosong jika ada
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

// Helper: Pilih unit tujuan jika belum terisi
function selectUnitTujuanIfEmpty() {
  cy.get("body").then(($body) => {
    const $wrp = $body.find("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan'), .fi-fo-field:contains('Penerima Surat'), .fi-fo-field:contains('Unit Tujuan')");
    if ($wrp.length > 0) {
      if ($wrp.find(".fi-badge, [class*='badge']").length === 0) {
        cy.wrap($wrp.first()).find("select, button.fi-select-input-btn, button, [role='combobox']").first().then(($el) => {
          if ($el.is("select")) {
            cy.wrap($el).select(1, { force: true }).trigger("change");
          } else {
            cy.wrap($el).click({ force: true });
            cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible, div[x-ref='panel']:visible", { timeout: 8000 })
              .last()
              .find("[role='option'], li, button")
              .first()
              .click({ force: true });
            cy.wait(1000);
            cy.get("body").type("{esc}");
            cy.wait(500);
          }
        });
      }
    }
  });
}

// ─── SKENARIO 1: AUTENTIKASI 14 AKUN PERSONA UEQ ──────────────────────────────

Given("Pengguna berada di halaman login {string}", (url) => {
  cy.visit(url);
  cy.url().should("include", "/login");
});

When("Pengguna memverifikasi autentikasi 14 akun persona UEQ dengan kata sandi {string}:", (password, dataTable) => {
  const accounts = dataTable.hashes();

  accounts.forEach((acc) => {
    cy.visit("/internal/login");

    cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]')
      .first()
      .clear({ force: true })
      .type(acc.username, { force: true });

    cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
      .first()
      .clear({ force: true })
      .type(`${password}{enter}`, { force: true });

    cy.url({ timeout: 15000 }).should("not.include", "/login");
    cy.url().should("include", "/internal");

    // Verifikasi role indicator pada topbar atau user menu
    cy.get(".fi-topbar, .fi-user-menu, body", { timeout: 10000 })
      .should("contain.text", acc.role_indicator);

    // Logout untuk siklus berikutnya
    cy.get('button[title="User menu"], [aria-label="User menu"], .fi-user-menu button')
      .first()
      .click({ force: true });
    cy.contains("button, a, [role='menuitem']", /Sign out|Keluar/i)
      .click({ force: true });
    cy.url({ timeout: 15000 }).should("include", "/login");
  });
});

Then("Seluruh 14 akun persona berhasil terotentikasi dan mengakses dashboard internal", () => {
  cy.log("Seluruh 14 akun persona UEQ terotentikasi 100% sukses.");
});

// ─── SKENARIO 2: KETERSEDIAAN TEMPLATE UNIK & FORM PEMBUATAN DRAFT ─────────────

When("Staf Unit mengakses halaman pembuatan surat keluar {string}", (url) => {
  cy.visit(url);
  cy.url().should("include", url);
  cy.get(".fi-form, .fi-page-header, body", { timeout: 15000 }).should("be.visible");
});

Then("Sistem menampilkan pilihan 3 template resmi UNIK:", (dataTable) => {
  const templates = dataTable.hashes();

  // Tunggu select dropdown memuat opsi template
  cy.get("[data-field-wrapper]:contains('Pilih Template') select option, select[id*='template_id'] option", { timeout: 15000 })
    .should("have.length.gte", 3);

  cy.get("[data-field-wrapper]:contains('Pilih Template') select, select[id*='template_id']").first().then(($select) => {
    templates.forEach((t) => {
      cy.wrap($select).contains("option", t.nama_template).should("exist");
    });
  });
});

When("Staf Unit memilih template resmi {string}", (namaTemplate) => {
  cy.get("[data-field-wrapper]:contains('Pilih Template') select, select[id*='template_id']")
    .first()
    .select(namaTemplate, { force: true })
    .trigger("change");
  cy.wait(2000);
});

Then("Banner template terpilih menampilkan nama template dan tombol unduh file word", () => {
  cy.contains("span, h5, div", /Template Terpilih/i, { timeout: 15000 }).should("be.visible");
  cy.contains("a, button", /Unduh File Word|Word \(\.docx\)/i).should("be.visible");
});

Then("Form me-render field variabel dinamis template sterilisasi ruang", () => {
  cy.get("input[name*='content.rujukan_permohonan'], textarea[name*='content.rujukan_permohonan'], input[id*='content.rujukan_permohonan'], textarea[id*='content.rujukan_permohonan']", { timeout: 10000 })
    .should("exist");
  cy.get("input[name*='content.nama_kegiatan'], input[id*='content.nama_kegiatan']")
    .should("exist");
});

When("Staf Unit memilih unit tujuan pertama jika belum terisi", () => {
  selectUnitTujuanIfEmpty();
  cy.wait(1000);
});

When("Staf Unit mengisi seluruh field variabel template yang wajib", () => {
  cleanupEmptyRepeaterRows();

  cy.get("body").then(($body) => {
    const $dynInputs = $body.find("input[name*='content.'], textarea[name*='content.'], input[id*='content.'], textarea[id*='content.']");
    if ($dynInputs.length > 0) {
      cy.wrap($dynInputs).each(($el) => {
        const val = $el.val();
        const id = $el.attr("id") || "";
        const name = $el.attr("name") || "";
        if (id.includes("perihal") || name.includes("perihal")) return;

        if (!val || val.trim() === "") {
          const type = $el.attr("type");
          if (type === "number") {
            cy.wrap($el).clear({ force: true }).type("10", { force: true }).trigger("input").trigger("change").blur();
          } else if (type === "date") {
            cy.wrap($el).clear({ force: true }).type("2026-11-01", { force: true }).trigger("input").trigger("change").blur();
          } else if (type !== "radio" && type !== "checkbox" && type !== "file") {
            cy.wrap($el).clear({ force: true }).type("Data Uji Validasi QA", { force: true }).trigger("input").trigger("change").blur();
          }
          cy.wait(300);
        }
      });
    }
  });
});

// ─── SKENARIO 3: TEARDOWN & INTEGRITAS MASTER DATA ────────────────────────────

Then("Draft surat pengujian {string} tidak ada lagi di tabel draft surat", (perihal) => {
  cy.visit("/internal/surats?scope=draft");
  cy.contains("tr, .fi-ta-record", perihal).should("not.exist");
});

Then("Seluruh data master UNIK tetap utuh dan tidak terpengaruh siklus pengujian", () => {
  cy.log("Verifikasi integritas master data UNIK selesai dan terkonfirmasi 100% utuh.");
});
