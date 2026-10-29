import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── NAVIGASI PERSURATAN ADMIN ────────────────────────────────────────────────

Given("Saya mengakses halaman manajemen template surat", () => {
  cy.visit("/internal/template-resource/templates");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content", { timeout: 10000 }).should("be.visible");
});

Given("Saya mengakses halaman manajemen format nomor surat", () => {
  cy.visit("/internal/format-nomor-surats");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content", { timeout: 10000 }).should("be.visible");
});

// ─── FR-ADM-05: KATEGORI TEMPLATE STEPS ───────────────────────────────────────

When("Saya mengisi nama kategori baru {string} pada modal", (namaKategori) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .find("input[wire\\:model*='newKategoriNama'], input[placeholder*='Contoh']")
    .first()
    .clear()
    .type(namaKategori);
});

When("Saya menekan tombol {string} pada modal kategori", (buttonText) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .contains("button", buttonText)
    .first()
    .click({ force: true });
});

Then("Kategori {string} harus muncul pada daftar kategori di modal", (namaKategori) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .contains("tr", namaKategori)
    .should("be.visible");
});

When("Saya mengubah nama kategori {string} menjadi {string} pada modal", (namaLama, namaBaru) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .contains("tr", namaLama)
    .within(() => {
      cy.contains("button", "Ubah").click({ force: true });
    });

  cy.get(".fi-modal:visible")
    .find("input[wire\\:model*='editingKategoriNama']")
    .first()
    .clear()
    .type(namaBaru);

  cy.get(".fi-modal:visible")
    .contains("button", "Simpan")
    .first()
    .click({ force: true });
});

When("Saya menghapus kategori {string} pada modal", (namaKategori) => {
  cy.contains(".fi-modal:visible", /Kelola Kategori Template|Daftar Kategori/i, { timeout: 10000 })
    .contains("tr", namaKategori)
    .within(() => {
      cy.contains("button", "Hapus").click({ force: true });
    });
});

Then("Tombol hapus pada kategori yang sedang digunakan template harus dinonaktifkan", () => {
  cy.contains(".fi-modal:visible", /Kelola Kategori Template|Daftar Kategori/i, { timeout: 10000 })
    .find("table tbody tr")
    .filter((idx, tr) => {
      const text = Cypress.$(tr).text();
      return /\b[1-9]\d*\s+template\b/i.test(text);
    })
    .should("have.length.at.least", 1)
    .first()
    .within(() => {
      cy.contains("button", "Hapus").should("be.disabled");
    });
});

Then("Kategori {string} tidak boleh muncul pada daftar kategori di modal", (namaKategori) => {
  cy.contains(".fi-modal:visible", /Kelola Kategori Template|Daftar Kategori/i, { timeout: 10000 })
    .should("not.contain", namaKategori);
});

// ─── FR-ADM-04: TEMPLATE SURAT STEPS ──────────────────────────────────────────

When("Saya mengisi formulir template surat:", (dataTable) => {
  const data = dataTable.rowsHash();

  if (data.nama_template) {
    cy.get("input[id*='nama_template']").clear().type(data.nama_template);
  }
  if (data.deskripsi) {
    cy.get("textarea[id*='deskripsi']").clear().type(data.deskripsi);
  }
  if (data.aksesibilitas) {
    cy.get("[data-field-wrapper]:contains('Aksesibilitas'), .fi-fo-field:contains('Aksesibilitas')")
      .first()
      .then(($wrp) => {
        const $native = $wrp.find("select");
        if ($native.length > 0) {
          cy.wrap($native.first()).select(data.aksesibilitas, { force: true }).trigger("change");
        } else {
          cy.wrap($wrp).find("button.fi-select-input-btn, button, [role='combobox']").first().click({ force: true });
          cy.wait(800);
          cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
            .contains("[role='option'], li, button", /Internal/i)
            .click({ force: true });
        }
      });
    cy.wait(1500);
  }
  if (data.is_active === "true" || data.status === "aktif" || data.aksesibilitas === "INTERNAL") {
    cy.get("body").then(($body) => {
      const $toggle = $body.find("[data-field-wrapper]:contains('Template Aktif'), .fi-fo-field:contains('Template Aktif')").find("button[role='switch']");
      if ($toggle.length > 0 && $toggle.attr("aria-checked") === "false") {
        cy.wrap($toggle).click({ force: true });
        cy.wait(500);
      }
    });
  }

  // Isi placeholder repeater jika item default ada
  cy.get("body").then(($body) => {
    const $keyInput = $body.find("input[placeholder*='contoh: nama'], input[id*='field_variables'][id*='key']");
    if ($keyInput.length > 0) {
      cy.wrap($keyInput.first()).clear({ force: true }).type("perihal", { force: true });
    }
    const $labelInput = $body.find("input[placeholder*='contoh: Nama Lengkap'], input[id*='field_variables'][id*='label']");
    if ($labelInput.length > 0) {
      cy.wrap($labelInput.first()).clear({ force: true }).type("Perihal Surat", { force: true });
    }
  });

  // Pilih jabatan pada Jalur Persetujuan jika item default ada
  cy.get("body").then(($body) => {
    const $jabatanWrapper = $body.find(".fi-fo-field-wrp:contains('Jabatan'), [data-field-wrapper]:contains('Jabatan')");
    if ($jabatanWrapper.length > 0) {
      const $jabatanBtn = $jabatanWrapper.find("button.fi-select-input-btn");
      if ($jabatanBtn.length > 0) {
        cy.wrap($jabatanBtn.first()).click({ force: true });
        cy.get(".fi-dropdown-panel:visible", { timeout: 6000 })
          .find("li[role='option'], li")
          .first()
          .click({ force: true });
      }
    }
  });
});

When("Saya memilih kategori template pertama yang tersedia", () => {
  cy.get(".fi-fo-field-wrp:contains('Kategori'), [data-field-wrapper]:contains('Kategori')")
    .first()
    .find("button.fi-select-input-btn")
    .first()
    .click({ force: true });

  // Karena searchable tanpa preload, ketik karakter untuk memicu query pencarian Livewire
  cy.get(".fi-dropdown-panel:visible", { timeout: 6000 }).within(() => {
    cy.get("input").first().type("a", { force: true });
  });

  // Tunggu debounce 1000ms + Livewire AJAX response
  cy.wait(1500);

  cy.get(".fi-dropdown-panel:visible", { timeout: 6000 })
    .find("li[role='option'], li")
    .first()
    .click({ force: true });
});

Then("Template {string} harus muncul pada daftar template", (namaTemplate) => {
  cy.visit("/internal/template-resource/templates");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content, body", { timeout: 10000 })
    .should("contain", namaTemplate);
});

Then("Form template tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert']", { timeout: 6000 })
    .should("exist");
});

When("Saya mencari template dengan kata kunci {string}", (keyword) => {
  cy.get("body").then(($body) => {
    const $search = $body.find(".fi-ta-search-field input, input[type='search'], input[placeholder*='Cari'], input[placeholder*='Search']");
    if ($search.length > 0 && $search.is(":visible")) {
      cy.wrap($search.first()).clear().type(`${keyword}{enter}`);
      cy.wait(1500);
    }
  });
});

When("Saya membuka form edit template {string}", (namaTemplate) => {
  cy.contains("h3", namaTemplate, { timeout: 10000 })
    .closest("div")
    .parent()
    .within(() => {
      cy.contains("a", "Edit").click({ force: true });
    });
  cy.url({ timeout: 10000 }).should("include", "/edit");
});

When("Saya mengubah nama template menjadi {string}", (newName) => {
  cy.get("input[id*='nama_template']")
    .clear()
    .type(newName);
});

Then("Template {string} tidak boleh muncul pada daftar template", (namaTemplate) => {
  cy.visit("/internal/template-resource/templates");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content", { timeout: 10000 })
    .should("not.contain", namaTemplate);
});

// ─── FR-ADM-06: FORMAT NOMOR SURAT STEPS ──────────────────────────────────────

When("Saya mengisi formulir format nomor surat:", (dataTable) => {
  const data = dataTable.rowsHash();

  if (data.nama_format) {
    cy.get("input[id*='nama_format']").clear().type(data.nama_format);
  }
  if (data.format_penomoran) {
    cy.get("input[id*='format_penomoran']").clear().type(data.format_penomoran, { parseSpecialCharSequences: false });
  }
});

Then("Format nomor {string} harus muncul pada daftar format nomor", (namaFormat) => {
  cy.visit("/internal/format-nomor-surats");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content", { timeout: 10000 })
    .should("contain", namaFormat);
});

Then("Form format nomor tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert']", { timeout: 6000 })
    .should("exist");
});

When("Saya mencari format nomor dengan kata kunci {string}", (keyword) => {
  cy.get("input[type='search'], input[placeholder*='Cari']", { timeout: 10000 })
    .first()
    .clear()
    .type(`${keyword}{enter}`);
  cy.wait(1200);
});

When("Saya membuka form edit format nomor {string}", (namaFormat) => {
  cy.contains("tr, .fi-ta-record", namaFormat, { timeout: 10000 })
    .within(() => {
      cy.contains("a, button", "Edit").click({ force: true });
    });
  cy.url({ timeout: 10000 }).should("include", "/edit");
});

When("Saya mengubah nama format nomor menjadi {string}", (newName) => {
  cy.get("input[id*='nama_format']")
    .clear()
    .type(newName);
});

Then("Format nomor {string} tidak boleh muncul pada daftar format nomor", (namaFormat) => {
  cy.visit("/internal/format-nomor-surats");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content", { timeout: 10000 })
    .should("not.contain", namaFormat);
});
