import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("Saya berada di halaman manajemen organisasi", () => {
  cy.visit("/internal/manage-organisasi");
  cy.get("#org-canvas-outer", { timeout: 10000 }).should("be.visible");
});

When("Saya menekan tombol tambah unit", () => {
  // Cek apakah canvas masih kosong atau sudah memiliki unit
  cy.get("body").then(($body) => {
    if ($body.find("button:contains('Buat Unit Utama Pertama')").length > 0) {
      cy.contains("button", "Buat Unit Utama Pertama").click();
    } else {
      // Klik tombol Tambah Unit atau Buat Unit Dibawahnya pada kartu unit pertama yang tersedia
      cy.get("button[wire\\:click*='createUnit'], button:contains('Tambah Unit'), button:contains('Buat Unit Dibawahnya')")
        .first()
        .scrollIntoView()
        .click({ force: true });
    }
  });

  // Pastikan modal Tambah Unit muncul
  cy.get(".fi-modal:visible", { timeout: 8000 }).should("be.visible");
});

When("Saya mengisi data unit:", (dataTable) => {
  const data = dataTable.rowsHash();

  cy.get(".fi-modal:visible").within(() => {
    // 1. Nama Unit
    if (data.nama_unit !== undefined) {
      cy.get("input[id*='nama_unit']")
        .clear()
        .type(data.nama_unit);
    }

    // 2. Singkatan
    if (data.singkatan !== undefined) {
      cy.get("input[id*='singkatan']")
        .clear()
        .type(data.singkatan);
    }

    // 3. Jenis Unit (Filament Select / Searchable)
    if (data.jenis_unit !== undefined) {
      cy.contains("label", "Jenis Unit")
        .parent()
        .then(($wrapper) => {
          const $select = $wrapper.find("select");
          if ($select.length > 0) {
            cy.wrap($select).select(data.jenis_unit);
          } else {
            // Filament custom searchable select
            cy.wrap($wrapper)
              .find("button, input[role='combobox'], [role='combobox']")
              .first()
              .click();
            cy.get(".fi-dropdown-panel, .fi-select-panel, [role='listbox']", { timeout: 5000 })
              .contains(data.jenis_unit)
              .click();
          }
        });
    }
  });
});

Then("Unit {string} harus muncul pada bagan organisasi", (unitName) => {
  cy.get("#org-canvas-inner", { timeout: 10000 })
    .contains(unitName)
    .should("be.visible");
});

Then("Form unit tidak terkirim dan modal tetap terbuka", () => {
  cy.get(".fi-modal:visible", { timeout: 5000 }).should("be.visible");
});

When("Saya membuka form edit untuk unit {string}", (unitName) => {
  // Cari card unit berdasarkan nama dan klik tombol edit (heroicon pencil)
  cy.contains("#org-canvas-inner p", unitName)
    .parents("div.relative.flex.flex-col")
    .first()
    .within(() => {
      cy.get("button[wire\\:click*='editUnit'], button[title*='Edit'], button[aria-label*='Edit']")
        .click({ force: true });
    });

  cy.get(".fi-modal:visible", { timeout: 8000 }).should("be.visible");
});

When("Saya mengubah nama unit menjadi {string}", (newName) => {
  cy.get(".fi-modal:visible")
    .find("input[id*='nama_unit']")
    .clear()
    .type(newName);
});

When("Saya mengubah singkatan unit menjadi {string}", (newSingkatan) => {
  cy.get(".fi-modal:visible")
    .find("input[id*='singkatan']")
    .clear()
    .type(newSingkatan);
});

When("Saya mengosongkan nama unit", () => {
  cy.get(".fi-modal:visible")
    .find("input[id*='nama_unit']")
    .clear();
});

When("Saya menambahkan jabatan baru {string} dengan level {string}", (namaJabatan, levelJabatan) => {
  cy.get(".fi-modal:visible").within(() => {
    cy.contains("button", "+ Tambah Jabatan").click();

    // Isi field jabatan pada item repeater terakhir
    cy.get("input[id*='nama_jabatan']")
      .last()
      .clear()
      .type(namaJabatan);

    cy.get("input[id*='level_jabatan']")
      .last()
      .clear()
      .type(levelJabatan);
  });
});

When("Saya mencoba menghapus unit induk yang memiliki sub-unit", () => {
  // Cari unit card yang memiliki elemen sub-unit/children di bawahnya
  cy.get("#org-canvas-inner")
    .find(".border-dashed")
    .first()
    .parent()
    .find("div.relative.flex.flex-col")
    .first()
    .within(() => {
      cy.get("button[wire\\:click*='deleteUnit'], button[title*='Hapus'], button[aria-label*='Hapus']")
        .click({ force: true });
    });

  // Konfirmasi modal penghapusan
  cy.get(".fi-modal:visible", { timeout: 8000 })
    .contains("button", "Ya, Hapus")
    .click();
});

Then("Sistem menolak penghapusan unit dengan peringatan", () => {
  // Server harus mengirimkan notifikasi danger atau menolak penghapusan
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='alert'], body",
    "Gagal menghapus unit",
    { timeout: 10000 }
  ).should("be.visible");
});

When("Saya menghapus unit {string}", (unitName) => {
  cy.contains("#org-canvas-inner p", unitName)
    .parents("div.relative.flex.flex-col")
    .first()
    .within(() => {
      cy.get("button[wire\\:click*='deleteUnit'], button[title*='Hapus'], button[aria-label*='Hapus']")
        .click({ force: true });
    });

  cy.get(".fi-modal:visible", { timeout: 8000 }).should("be.visible");
});

Then("Unit {string} tidak boleh muncul pada bagan organisasi", (unitName) => {
  cy.get("#org-canvas-inner", { timeout: 10000 })
    .should("not.contain", unitName);
});
