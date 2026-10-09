import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── NAVIGASI ─────────────────────────────────────────────────────────────────

Given("Saya mengakses halaman manajemen pegawai", () => {
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 }).should("be.visible");
});

Given("Saya mengakses halaman manajemen mahasiswa", () => {
  cy.visit("/internal/user-mahasiswas");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 }).should("be.visible");
});

// ─── PEGAWAI STEPS ────────────────────────────────────────────────────────────

When("Saya mengisi data identitas pegawai:", (dataTable) => {
  const data = dataTable.rowsHash();

  if (data.nip) {
    cy.get("input[id*='nip']").clear().type(data.nip);
  }
  if (data.nama_lengkap) {
    cy.get("input[id*='nama_lengkap']").clear().type(data.nama_lengkap);
  } else if (data.nama_lengkap === "") {
    cy.get("input[id*='nama_lengkap']").clear();
  }
  if (data.email) {
    cy.get("input[id*='email']").clear().type(data.email);
  }
});

When("Saya menugaskan unit kerja dan jabatan pertama pada pegawai", () => {
  // Pilih Unit Kerja pada baris repeater jabatan pertama
  cy.contains("label", "Unit Kerja")
    .first()
    .parent()
    .parent()
    .find("button, [role='combobox'], .fi-select-input")
    .first()
    .click({ force: true });

  cy.get("[role='listbox']:visible, .fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 6000 })
    .find("[role='option'], li, button, span")
    .first()
    .click({ force: true });

  // Tunggu Livewire memuat opsi jabatan untuk unit yang dipilih
  cy.wait(1000);

  // Pilih Jabatan
  cy.contains("label", "Jabatan")
    .first()
    .parent()
    .parent()
    .find("button, [role='combobox'], .fi-select-input")
    .first()
    .click({ force: true });

  cy.get("[role='listbox']:visible, .fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 6000 })
    .find("[role='option'], li, button, span")
    .first()
    .click({ force: true });
});

When("Saya menekan tombol {string} pada form", (buttonText) => {
  cy.get("form")
    .contains("button", buttonText, { matchCase: false })
    .click({ force: true });
});

Then("Pegawai dengan NIP {string} harus muncul pada daftar pegawai", (nip) => {
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("contain", nip);
});

Then("Form pegawai tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid", { timeout: 5000 })
    .should("exist");
});

When("Saya mencari pegawai dengan kata kunci {string}", (keyword) => {
  cy.get("input[type='search'], input[placeholder*='Cari']", { timeout: 10000 })
    .first()
    .clear()
    .type(`${keyword}{enter}`);
  cy.wait(1000);
});

When("Saya membuka form edit pegawai {string}", (namaPegawai) => {
  cy.contains("tr", namaPegawai)
    .within(() => {
      cy.contains("a, button", "Edit").click({ force: true });
    });
  cy.url({ timeout: 10000 }).should("include", "/edit");
});

When("Saya mengubah nama lengkap pegawai menjadi {string}", (newName) => {
  cy.get("input[id*='nama_lengkap']")
    .clear()
    .type(newName);
});

When("Saya mengisi nomor telepon pegawai {string}", (phone) => {
  cy.get("input[id*='phone']")
    .clear()
    .type(phone);
});

Then("Pegawai dengan nama {string} harus muncul pada daftar pegawai", (namaPegawai) => {
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("contain", namaPegawai);
});

When("Saya menekan tombol {string} pada halaman edit", (buttonText) => {
  cy.get(".fi-header-actions, header, .fi-ac-action")
    .contains("button", buttonText, { matchCase: false })
    .click({ force: true });
});

When("Saya mengonfirmasi tindakan pada modal", () => {
  cy.get(".fi-modal:visible", { timeout: 6000 })
    .contains("button", "Hapus", { matchCase: false })
    .click({ force: true });
});

Then("Pegawai dengan NIP {string} tidak boleh muncul pada daftar pegawai", (nip) => {
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("not.contain", nip);
});

// ─── MAHASISWA STEPS ──────────────────────────────────────────────────────────

When("Saya mengisi data identitas mahasiswa:", (dataTable) => {
  const data = dataTable.rowsHash();

  if (data.nim) {
    cy.get("input[id*='nim']").clear().type(data.nim);
  }
  if (data.nama_lengkap) {
    cy.get("input[id*='nama_lengkap']").clear().type(data.nama_lengkap);
  } else if (data.nama_lengkap === "") {
    cy.get("input[id*='nama_lengkap']").clear();
  }
  if (data.email) {
    cy.get("input[id*='email']").clear().type(data.email);
  }
});

When("Saya memilih program studi mahasiswa pertama yang tersedia", () => {
  cy.contains("label", "Prodi")
    .parent()
    .parent()
    .find("button, [role='combobox'], .fi-select-input")
    .first()
    .click({ force: true });

  cy.get("[role='listbox']:visible, .fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 6000 })
    .find("[role='option'], li, button, span")
    .first()
    .click({ force: true });
});

Then("Mahasiswa dengan NIM {string} harus muncul pada daftar mahasiswa", (nim) => {
  cy.visit("/internal/user-mahasiswas");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("contain", nim);
});

Then("Form mahasiswa tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid", { timeout: 5000 })
    .should("exist");
});

When("Saya mencari mahasiswa dengan kata kunci {string}", (keyword) => {
  cy.get("input[type='search'], input[placeholder*='Cari']", { timeout: 10000 })
    .first()
    .clear()
    .type(`${keyword}{enter}`);
  cy.wait(1000);
});

When("Saya membuka form edit mahasiswa {string}", (namaMhs) => {
  cy.contains("tr", namaMhs)
    .within(() => {
      cy.contains("a, button", "Edit").click({ force: true });
    });
  cy.url({ timeout: 10000 }).should("include", "/edit");
});

When("Saya mengubah status mahasiswa menjadi {string}", (statusLabel) => {
  cy.contains("label", "Status")
    .parent()
    .parent()
    .find("button, [role='combobox'], .fi-select-input")
    .first()
    .click({ force: true });

  cy.get("[role='listbox']:visible, .fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 6000 })
    .contains(statusLabel)
    .click({ force: true });
});

Then("Mahasiswa {string} memiliki status {string} pada daftar mahasiswa", (namaMhs, statusLabel) => {
  cy.visit("/internal/user-mahasiswas");
  cy.contains("tr", namaMhs, { timeout: 10000 })
    .should("contain", statusLabel);
});

Then("Mahasiswa dengan NIM {string} tidak boleh muncul pada daftar mahasiswa", (nim) => {
  cy.visit("/internal/user-mahasiswas");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("not.contain", nim);
});
