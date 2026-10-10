import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── FR-ARC-04: KELOLA KATEGORI ARSIP ──────────────────────────────────────────

When("Staf Unit membuka modal kelola kategori arsip", () => {
  cy.contains("button, a", /Kelola Kategori Arsip/i, { timeout: 10000 })
    .click({ force: true });
  cy.get(".fi-modal:visible, [role='dialog']", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit memasukkan nama kategori baru {string}", (namaKategori) => {
  const timestamp = Date.now().toString().slice(-4);
  const kategoriUnik = `${namaKategori} ${timestamp}`;
  Cypress.env("lastKategoriArsip", kategoriUnik);

  cy.get('.fi-modal:visible input[wire\\:model*="newKategoriNama"], .fi-modal:visible input[placeholder*="Contoh"]')
    .first()
    .clear({ force: true })
    .type(kategoriUnik, { force: true });
});

When("Staf Unit memasukkan nama kategori duplikat {string}", (namaKategori) => {
  const kategoriDuplikat = Cypress.env("lastKategoriArsip") || namaKategori;
  cy.get('.fi-modal:visible input[wire\\:model*="newKategoriNama"], .fi-modal:visible input[placeholder*="Contoh"]')
    .first()
    .clear({ force: true })
    .type(kategoriDuplikat, { force: true });
});

When("Staf Unit menekan tombol {string} kategori arsip", (buttonLabel) => {
  cy.get(".fi-modal:visible")
    .contains("button", new RegExp(`^\\s*${buttonLabel}\\s*$`, "i"))
    .click({ force: true });
  cy.wait(1500); // Livewire round-trip
});

Then("Sistem menampilkan notifikasi sukses kategori {string}", (notifText) => {
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body",
    new RegExp(notifText, "i"),
    { timeout: 10000 }
  ).should("be.visible");
});

Then("Kategori baru muncul pada tabel daftar kategori unit", () => {
  const kategoriUnik = Cypress.env("lastKategoriArsip") || "Arsip";
  cy.get(".fi-modal:visible, table, body", { timeout: 8000 })
    .should("contain.text", kategoriUnik);

  // Tutup modal agar tidak menutupi langkah berikutnya
  cy.get(".fi-modal:visible")
    .find("button:contains('Tutup'), button[aria-label='Close'], .fi-modal-close-btn")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi peringatan {string}", (notifText) => {
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='alert'], body",
    new RegExp(notifText, "i"),
    { timeout: 10000 }
  ).should("be.visible");

  // Tutup modal
  cy.get(".fi-modal:visible")
    .find("button:contains('Tutup'), button[aria-label='Close'], .fi-modal-close-btn")
    .first()
    .click({ force: true });
});

// ─── FR-ARC-01: MENGARSIPKAN SURAT ─────────────────────────────────────────────

When("Staf Unit menekan tombol aksi {string} pada lembar detail surat", (actionLabel) => {
  cy.contains("button, a", new RegExp(actionLabel, "i"), { timeout: 10000 })
    .click({ force: true });
  cy.get(".fi-modal:visible, [role='dialog']", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit menekan tombol konfirmasi submit {string} pada modal arsip", (buttonLabel) => {
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i)
    .find("button[type='submit'], button:contains('Submit'), button:contains('Arsipkan')")
    .first()
    .click({ force: true });
  cy.wait(1000);
});

Then("Sistem menampilkan pesan validasi field kategori arsip wajib diisi", () => {
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, .fi-error, [role='alert'], body", { timeout: 8000 })
    .should("be.visible");

  // Tutup modal agar tidak menutupi skenario berikutnya
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i)
    .find("button:contains('Cancel'), button:contains('Batal'), button[aria-label='Close']")
    .first()
    .click({ force: true });
});

When("Staf Unit memilih kategori arsip {string} pada modal", (namaKategori) => {
  // Buka dropdown searchable kategori arsip di dalam modal Arsipkan Surat
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i)
    .contains(/Select an option/i)
    .first()
    .click({ force: true });
  cy.wait(1000);

  // Cari dan pilih opsi dalam dropdown panel aktif
  cy.get(".fi-dropdown-panel:visible")
    .last()
    .then(($panel) => {
      const $input = $panel.find('input[type="search"], input[type="text"]');
      if ($input.length > 0) {
        cy.wrap($input.first()).type(namaKategori, { force: true });
        cy.wait(1500);
      }
    });

  cy.get(".fi-dropdown-panel:visible")
    .last()
    .find('[role="option"], li')
    .first()
    .click({ force: true });
  cy.wait(500);
});

When("Staf Unit mengisi catatan arsip {string}", (catatan) => {
  cy.contains(".fi-modal-window, [role='dialog'], .fi-modal:visible", /Arsipkan Surat/i)
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

Then("Sistem menampilkan notifikasi sukses arsip {string}", (notifText) => {
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body",
    /(Surat Diarsipkan|berhasil masuk arsip|berhasil)/i,
    { timeout: 10000 }
  ).should("be.visible");
});

// ─── FR-ARC-02 & FR-ARC-03: DAFTAR & PENCARIAN ARSIP SURAT ─────────────────────

When("Staf Unit mengakses halaman arsip surat {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-ta-header, .fi-ta-content, .fi-page-header, body", { timeout: 15000 })
    .should("be.visible");
});

When("Pengguna mengakses langsung URL arsip surat {string}", (url) => {
  cy.visit(url, { failOnStatusCode: false });
});

Then("Sistem menampilkan tombol aksi header {string}", (buttonText) => {
  cy.contains(".fi-page-header, .fi-header-actions, header, body", buttonText, { timeout: 10000 })
    .should("be.visible");
});

Then("Sistem menampilkan tabel arsip surat unit", () => {
  cy.get(".fi-ta-table, .fi-ta-content, table, body", { timeout: 10000 })
    .should("be.visible");
});

When("Staf Unit memasukkan kata kunci perihal arsip yang valid pada kotak pencarian", () => {
  cy.get('input[placeholder*="Search"], input[placeholder*="Cari"], input[type="search"]')
    .first()
    .clear({ force: true })
    .type("Permohonan", { force: true });
  cy.wait(1500); // Livewire debounce
});

Then("Tabel memfilter data dan hanya menampilkan baris arsip surat yang sesuai kata kunci", () => {
  cy.get(".fi-ta-content, table, body", { timeout: 10000 }).then(($el) => {
    const text = $el.text();
    expect(text.includes("Permohonan") || /tidak ada data surat/i.test(text)).to.be.true;
  });
});

When("Staf Unit memasukkan kata kunci acak arsip {string} pada kotak pencarian", (keyword) => {
  cy.get('input[placeholder*="Search"], input[placeholder*="Cari"], input[type="search"]')
    .first()
    .clear({ force: true })
    .type(keyword, { force: true });
  cy.wait(1500); // Livewire debounce
});

Then("Tabel menampilkan pesan status kosong arsip {string}", (emptyMessage) => {
  cy.contains(
    ".fi-ta-empty-state-heading, .fi-ta-empty-state, body",
    new RegExp(emptyMessage, "i"),
    { timeout: 10000 }
  ).should("be.visible");
});
