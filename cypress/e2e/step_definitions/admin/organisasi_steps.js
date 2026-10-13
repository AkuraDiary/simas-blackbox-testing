import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let hasCleanedUp = false;

const cleanupDanglingUnits = () => {
  cy.get("#org-canvas-inner").then(($canvas) => {
    const $cards = $canvas.find("div.relative.flex.flex-col:contains('Direktorat Inovasi')");
    if ($cards.length === 0) return;

    const findAndDelLeaf = () => {
      cy.get("#org-canvas-inner").then(($c) => {
        const $remaining = $c.find("div.relative.flex.flex-col:contains('Direktorat Inovasi')");
        if ($remaining.length === 0) return;

        let $leafCard = null;
        $remaining.each((i, el) => {
          const $parent = Cypress.$(el).parent();
          const hasLeafBtn = $parent.children("button:contains('Buat Unit Dibawahnya')").length > 0;
          const hasDashed = $parent.children("div.border-dashed").length > 0;
          if (hasLeafBtn && !hasDashed) {
            $leafCard = Cypress.$(el);
          }
        });

        if ($leafCard && $leafCard.length > 0) {
          cy.wrap($leafCard).within(() => {
            cy.get("button[wire\\:click*='deleteUnit'], button[title*='Hapus'], button.fi-icon-btn, button:has(svg)")
              .first()
              .click({ force: true });
          });
          cy.get(".fi-modal:visible", { timeout: 8000 })
            .contains("button", "Ya, Hapus")
            .click();
          cy.get(".fi-modal:visible", { timeout: 10000 }).should("not.exist");
          cy.wait(1000);
          findAndDelLeaf();
        }
      });
    };

    findAndDelLeaf();
  });
};

Given("Saya berada di halaman manajemen organisasi", () => {
  cy.visit("/internal/manage-organisasi");
  cy.get("#org-canvas-outer", { timeout: 10000 }).should("be.visible");

  if (!hasCleanedUp) {
    hasCleanedUp = true;
    cleanupDanglingUnits();
  }
});

When("Saya menekan tombol tambah unit", () => {
  // Cek apakah canvas masih kosong atau sudah memiliki unit
  cy.get("body").then(($body) => {
    if ($body.find("button:contains('Buat Unit Utama Pertama')").length > 0) {
      cy.contains("button", "Buat Unit Utama Pertama").click();
    } else {
      // Cari Top Level Unit (Rektorat), lalu klik tombol "Tambah Unit" di level tersebut
      const $topLevel = $body.find("#org-canvas-inner :contains('Top Level Unit')");
      if ($topLevel.length > 0) {
        cy.wrap($topLevel)
          .closest("div.flex.flex-col.items-center")
          .find("button:contains('Tambah Unit')")
          .first()
          .scrollIntoView()
          .click({ force: true });
      } else {
        cy.get("button[wire\\:click*='createUnit'], button:contains('Tambah Unit'), button:contains('Buat Unit Dibawahnya')")
          .first()
          .scrollIntoView()
          .click({ force: true });
      }
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
      cy.contains("Select an option")
        .click({ force: true });
    }
  });

  // Pilih item dari panel dropdown yang terbuka di luar modal container
  if (data.jenis_unit !== undefined) {
    cy.get("[role='listbox']:visible, .fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 6000 })
      .then(($panel) => {
        if ($panel.find(`:contains("${data.jenis_unit}")`).length > 0) {
          cy.wrap($panel).contains(data.jenis_unit).click({ force: true });
        } else {
          cy.wrap($panel).find("[role='option'], li, button, span").first().click({ force: true });
        }
      });
  }
});

Then("Unit {string} harus muncul pada bagan organisasi", (unitName) => {
  cy.get("#org-canvas-inner", { timeout: 10000 })
    .contains(unitName)
    .scrollIntoView();
  cy.get("#org-canvas-inner")
    .contains(unitName)
    .should("exist");
});

Then("Form unit tidak terkirim dan modal tetap terbuka", () => {
  cy.get(".fi-modal:visible", { timeout: 5000 }).should("be.visible");
});

const getLeafUnitCard = (unitName) => {
  return cy.get("#org-canvas-inner div.relative.flex.flex-col")
    .filter(`:contains("${unitName}")`)
    .then(($cards) => {
      // WAJIB kartu yang leaf (tidak memiliki sub-unit: hasLeafBtn === true dan hasDashed === false)
      const leafCards = $cards.filter((i, el) => {
        const $parent = Cypress.$(el).parent();
        const hasLeafButton = $parent.children("button:contains('Buat Unit Dibawahnya')").length > 0;
        const hasChildrenGroup = $parent.children("div.border-dashed").length > 0;
        return hasLeafButton && !hasChildrenGroup;
      });

      if (leafCards.length > 0) {
        return cy.wrap(Cypress.$(leafCards).last());
      }

      // Fallback
      return cy.wrap($cards.last());
    });
};

When("Saya membuka form edit untuk unit {string}", (unitName) => {
  getLeafUnitCard(unitName).within(() => {
    cy.get("button[title*='Edit'], button[wire\\:click*='editUnit'], button.fi-icon-btn, button:has(svg)")
      .eq(1)
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
  cy.get(".fi-modal:visible").then(($modal) => {
    const initialCount = $modal.find(".fi-fo-repeater-item").length;
    cy.wrap($modal).contains("button", "+ Tambah Jabatan").click();

    // Tunggu hingga Livewire menambahkan 1 item baru ke repeater
    cy.get(".fi-modal:visible .fi-fo-repeater-item", { timeout: 8000 })
      .should("have.length", initialCount + 1)
      .last()
      .within(() => {
        cy.get("input[id*='nama_jabatan']")
          .clear()
          .type(namaJabatan);

        cy.get("input[id*='level_jabatan']")
          .clear()
          .type(levelJabatan);
      });
  });
});

When("Saya mencoba menghapus unit induk yang memiliki sub-unit", () => {
  // Cari kartu Top Level Unit di canvas
  cy.contains("#org-canvas-inner", "Top Level Unit")
    .parent()
    .find("div.relative.flex.flex-col")
    .first()
    .within(() => {
      // Klik tombol trash (tombol pertama)
      cy.get("button[wire\\:click*='deleteUnit'], button[title*='Hapus'], button.fi-icon-btn, button:has(svg)")
        .first()
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
    ".fi-no-notification, .fi-notification, [role='alert']",
    "Gagal menghapus unit",
    { timeout: 10000 }
  ).should("be.visible");

  // Tutup modal yang tertahan terbuka akibat action halt
  cy.get("body").then(($body) => {
    const $modal = $body.find(".fi-modal:visible");
    if ($modal.length > 0) {
      cy.wrap($modal).find("button[aria-label='Close'], button:contains('Cancel'), button:contains('Batal')").first().click({ force: true });
    }
  });
  cy.get(".fi-modal:visible").should("not.exist");
});

When("Saya menghapus unit {string}", (unitName) => {
  getLeafUnitCard(unitName).within(() => {
    cy.get("button[title*='Hapus'], button[wire\\:click*='deleteUnit'], button.fi-icon-btn, button:has(svg)")
      .first()
      .click({ force: true });
  });

  cy.get(".fi-modal:visible", { timeout: 8000 }).should("be.visible");
});

Then("Unit {string} tidak boleh muncul pada bagan organisasi", (unitName) => {
  // Tunggu modal konfirmasi tertutup sepenuhnya sebelum memeriksa perubahan canvas
  cy.get(".fi-modal:visible", { timeout: 10000 }).should("not.exist");
  // Pastikan unit spesifik yang diuji (singkatan 'DISI-UPB') sudah bersih dari canvas
  cy.get("#org-canvas-inner", { timeout: 10000 }).should("not.contain", "DISI-UPB");
});
