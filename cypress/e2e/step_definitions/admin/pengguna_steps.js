import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Dynamic test data management agar pengujian idempotent dan tidak bentrok unique constraint pada run berulang
let activeNip = null;
let activeNim = null;

const getEffectiveNip = (nip) => {
  if (nip === "198001012005011001") {
    if (!activeNip) {
      activeNip = "19800101" + Date.now().toString().slice(-10);
    }
    return activeNip;
  }
  return nip;
};

const getEffectiveNim = (nim) => {
  if (nim === "2010114001") {
    if (!activeNim) {
      activeNim = "2010" + Date.now().toString().slice(-6);
    }
    return activeNim;
  }
  return nim;
};

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
    const nipVal = getEffectiveNip(data.nip);
    cy.get("input[id*='nip']").clear().type(nipVal);
  }
  if (data.nama_lengkap) {
    cy.get("input[id*='nama_lengkap']").clear().type(data.nama_lengkap);
  } else if (data.nama_lengkap === "") {
    cy.get("input[id*='nama_lengkap']").clear();
  }
  if (data.email) {
    const emailVal = data.email === "budi@simas.com"
      ? `budi_${Date.now().toString().slice(-6)}@simas.com`
      : data.email;
    cy.get("input[id*='email']").clear().type(emailVal);
  }
});

When("Saya menugaskan unit kerja dan jabatan pertama pada pegawai", () => {
  // 1. Pilih Unit Kerja pada repeater jabatan
  cy.contains("[data-field-wrapper], .fi-fo-field", "Unit Kerja")
    .find("button.fi-select-input-btn")
    .first()
    .click({ force: true });

  cy.get(".fi-dropdown-panel:visible", { timeout: 6000 })
    .find("li[role='option'], li")
    .first()
    .click({ force: true });

  // Tunggu Livewire mengisi opsi Jabatan (karena unit_kerja_id -> live())
  cy.wait(1500);

  // 2. Pilih Jabatan
  cy.contains("[data-field-wrapper], .fi-fo-field", "Jabatan")
    .find("button.fi-select-input-btn")
    .first()
    .click({ force: true });

  cy.get(".fi-dropdown-panel:visible", { timeout: 6000 })
    .find("li[role='option'], li")
    .first()
    .click({ force: true });
});

When("Saya menekan tombol {string} pada form", (buttonText) => {
  // Menggunakan teks spesifik tombol submit form agar tidak salah mengklik tombol Sign out
  cy.get(".fi-form-actions, form")
    .find("button")
    .filter((_, el) => {
      const text = (el.innerText || el.textContent || "").trim();
      return /^(Create|Buat|Save|Simpan|Save changes|Simpan perubahan)$/i.test(text);
    })
    .first()
    .click({ force: true });
});

Then("Pegawai dengan NIP {string} harus muncul pada daftar pegawai", (nip) => {
  const nipVal = getEffectiveNip(nip);
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("contain", nipVal);
});

Then("Form pegawai tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert']", { timeout: 6000 })
    .should("exist");
});

When("Saya mencari pegawai dengan kata kunci {string}", (keyword) => {
  const keywordVal = keyword === "198001012005011001" ? getEffectiveNip(keyword) : keyword;
  cy.get("input[type='search'], input[placeholder*='Cari']", { timeout: 10000 })
    .first()
    .clear()
    .type(`${keywordVal}{enter}`);
  cy.wait(1200);
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
    .find("button:contains('Delete'), button:contains('Hapus')")
    .first()
    .click({ force: true });
});

When("Saya mengonfirmasi tindakan pada modal", () => {
  cy.get(".fi-modal:visible", { timeout: 6000 })
    .find("button:contains('Delete'), button:contains('Hapus'), button:contains('Ya, Hapus')")
    .first()
    .click({ force: true });
});

Then("Pegawai dengan NIP {string} tidak boleh muncul pada daftar pegawai", (nip) => {
  const nipVal = getEffectiveNip(nip);
  cy.visit("/internal/user-pegawais");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("not.contain", nipVal);
  activeNip = null;
});

// ─── MAHASISWA STEPS ──────────────────────────────────────────────────────────

When("Saya mengisi data identitas mahasiswa:", (dataTable) => {
  const data = dataTable.rowsHash();

  if (data.nim) {
    const nimVal = getEffectiveNim(data.nim);
    cy.get("input[id*='nim']").clear().type(nimVal);
  }
  if (data.nama_lengkap) {
    cy.get("input[id*='nama_lengkap']").clear().type(data.nama_lengkap);
  } else if (data.nama_lengkap === "") {
    cy.get("input[id*='nama_lengkap']").clear();
  }
  if (data.email) {
    const emailVal = data.email === "andi@student.simas.com"
      ? `andi_${Date.now().toString().slice(-6)}@student.simas.com`
      : data.email;
    cy.get("input[id*='email']").clear().type(emailVal);
  }
});

When("Saya memilih program studi mahasiswa pertama yang tersedia", () => {
  cy.contains("[data-field-wrapper], .fi-fo-field", "Prodi")
    .find("button.fi-select-input-btn")
    .first()
    .click({ force: true });

  cy.get(".fi-dropdown-panel:visible", { timeout: 6000 })
    .find("li[role='option'], li")
    .first()
    .click({ force: true });
});

Then("Mahasiswa dengan NIM {string} harus muncul pada daftar mahasiswa", (nim) => {
  const nimVal = getEffectiveNim(nim);
  cy.visit("/internal/user-mahasiswas");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("contain", nimVal);
});

Then("Form mahasiswa tidak terkirim dan menampilkan validasi error", () => {
  cy.url().should("include", "/create");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert']", { timeout: 6000 })
    .should("exist");
});

When("Saya mencari mahasiswa dengan kata kunci {string}", (keyword) => {
  const keywordVal = keyword === "2010114001" ? getEffectiveNim(keyword) : keyword;
  cy.get("input[type='search'], input[placeholder*='Cari']", { timeout: 10000 })
    .first()
    .clear()
    .type(`${keywordVal}{enter}`);
  cy.wait(1200);
});

When("Saya membuka form edit mahasiswa {string}", (namaMhs) => {
  cy.contains("tr", namaMhs)
    .within(() => {
      cy.contains("a, button", "Edit").click({ force: true });
    });
  cy.url({ timeout: 10000 }).should("include", "/edit");
});

When("Saya mengubah status mahasiswa menjadi {string}", (statusLabel) => {
  cy.contains("[data-field-wrapper], .fi-fo-field", "Status")
    .find("button.fi-select-input-btn, select")
    .first()
    .click({ force: true });

  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible", { timeout: 6000 })
    .contains("li[role='option'], li, option", statusLabel)
    .click({ force: true });
});

Then("Mahasiswa {string} memiliki status {string} pada daftar mahasiswa", (namaMhs, statusLabel) => {
  cy.visit("/internal/user-mahasiswas");
  const regex = new RegExp(statusLabel, "i");
  cy.contains("tr", namaMhs, { timeout: 10000 })
    .invoke("text")
    .should("match", regex);
});

Then("Mahasiswa dengan NIM {string} tidak boleh muncul pada daftar mahasiswa", (nim) => {
  const nimVal = getEffectiveNim(nim);
  cy.visit("/internal/user-mahasiswas");
  cy.get(".fi-ta-table, [role='table']", { timeout: 10000 })
    .should("not.contain", nimVal);
  activeNim = null;
});
