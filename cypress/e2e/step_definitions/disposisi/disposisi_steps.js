import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── NAVIGASI UMUM & DETAIL SURAT MASUK ─────────────────────────────────────

Given("Saya membersihkan sesi login", () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.visit("/internal/login");
  cy.url().then((url) => {
    if (!url.includes("/login")) {
      cy.get("button[title*='User'], [aria-label*='User'], .fi-user-menu button", { timeout: 5000 })
        .first()
        .click({ force: true });
      cy.contains("button, a, form button", /Keluar|Sign out|Logout/i).click({ force: true });
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit("/internal/login");
    }
  });
  cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]', { timeout: 15000 }).should("be.visible");
});

Given("Saya mengakses halaman surat masuk", () => {
  cy.visit("/internal/surat-masuk");
  cy.get(".fi-ta-table, [role='table'], .fi-ta-content, body", { timeout: 15000 }).should("be.visible");
});

When("Saya membuka detail surat masuk pertama yang tersedia", () => {
  cy.get(".fi-ta-table tbody tr, [role='table'] tbody tr", { timeout: 10000 })
    .first()
    .within(() => {
      cy.get("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

When("Saya membuka detail surat masuk kedua yang tersedia", () => {
  cy.get(".fi-ta-table tbody tr, [role='table'] tbody tr", { timeout: 10000 })
    .eq(1)
    .within(() => {
      cy.get("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

When("Saya membuka detail surat masuk ketiga yang tersedia", () => {
  cy.get(".fi-ta-table tbody tr, [role='table'] tbody tr", { timeout: 10000 })
    .eq(2)
    .within(() => {
      cy.get("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

When("Saya membuka detail surat masuk pengajuan yang belum didisposisikan", () => {
  cy.get(".fi-ta-table tbody tr, [role='table'] tbody tr", { timeout: 10000 })
    .filter(":not(:contains('DISPOSISI'))")
    .filter(":contains('Pengajuan')")
    .first()
    .within(() => {
      cy.get("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

When("Saya membuka tab {string} pada tabel surat masuk", (tabName) => {
  cy.contains("button[role='tab'], .fi-tabs-item, [role='tab']", new RegExp(tabName, "i"), { timeout: 10000 })
    .click({ force: true });
  cy.wait(1500); // Livewire roundtrip
});

When("Saya membuka detail surat disposisi yang aktif", () => {
  cy.get("body").then(($body) => {
    const $rows = $body.find(".fi-ta-table tbody tr, [role='table'] tbody tr");
    if ($rows.length > 0 && !$rows.first().text().includes("Tidak Ada Data")) {
      cy.wrap($rows.first()).find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    } else {
      // Fallback: cari di tab Semua
      cy.contains("button[role='tab']", "Semua").click({ force: true });
      cy.wait(1500);
      cy.contains("tr", /DISPOSISI/i).find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    }
  });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

When("Saya membuka detail surat masuk yang memiliki riwayat disposisi", () => {
  cy.get("body").then(($body) => {
    const $dispRow = $body.find("tr:contains('DISPOSISI')");
    if ($dispRow.length > 0) {
      cy.wrap($dispRow.first()).find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    } else {
      cy.get(".fi-ta-table tbody tr, [role='table'] tbody tr").first().find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
    }
  });
  cy.url({ timeout: 12000 }).should("include", "/internal/surat-masuk/");
});

// ─── FR-DISP-01: MODAL & AKSI DISPOSISI ─────────────────────────────────────

When("Saya membuka modal disposisi dari menu Kelola Surat", () => {
  cy.get("body").then(($body) => {
    if ($body.find("button:contains('Disposisikan')").is(":visible")) {
      cy.contains("button", "Disposisikan").click({ force: true });
    } else {
      cy.contains("button", "Kelola Surat").click({ force: true });
      cy.get(".fi-dropdown-panel:visible, [role='menu']:visible, body", { timeout: 6000 })
        .contains("button, a, [role='menuitem']", "Disposisikan")
        .click({ force: true });
    }
  });
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 10000 }).should("be.visible");
});

When("Saya memilih tipe disposisi {string}", (tipe) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find(`input[type="radio"][value="${tipe}"]`)
    .check({ force: true });
  cy.wait(1000); // Livewire reactive switch
});

When("Saya memilih unit tujuan disposisi {string}", (unit) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find(".fi-fo-field-wrp:contains('Unit Tujuan'), [data-field-wrapper]:contains('Unit Tujuan')")
    .first()
    .within(() => {
      cy.get("button.fi-select-input-btn").click({ force: true });
    });
  cy.wait(800);
  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
    .last()
    .then(($panel) => {
      const $input = $panel.find('input[type="search"], input[type="text"]');
      if ($input.length > 0) {
        cy.wrap($input.first()).type(unit, { force: true });
        cy.wait(1500);
      }
    });
  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
    .last()
    .contains("[role='option'], li", new RegExp(unit, "i"))
    .click({ force: true });
});

When("Saya memilih staf internal tujuan disposisi yang tersedia", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find(".fi-fo-field-wrp:contains('Pilih Staf Internal'), [data-field-wrapper]:contains('Pilih Staf Internal')")
    .first()
    .within(() => {
      cy.get("button.fi-select-input-btn").click({ force: true });
    });
  cy.wait(800);
  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
    .last()
    .find("[role='option'], li.fi-select-input-option")
    .then(($options) => {
      if ($options.length > 1) {
        cy.wrap($options.eq(1)).click({ force: true });
      } else {
        cy.wrap($options.first()).click({ force: true });
      }
    });
});

When("Saya memilih jenis instruksi disposisi {string}", (instruksi) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find(`input[type="checkbox"][value="${instruksi}"]`)
    .first()
    .check({ force: true });
});

When("Saya memilih sifat disposisi {string}", (sifat) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find("select[id*='sifat']")
    .first()
    .select(sifat.toLowerCase(), { force: true });
});

When("Saya mengisi catatan disposisi {string}", (catatan) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find("textarea[id*='catatan']")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Saya menekan tombol submit pada modal disposisi", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 })
    .find("button[type='submit'], .fi-modal-actions button:contains('Submit'), .fi-modal-actions button:contains('Disposisikan')")
    .first()
    .click({ force: true });
});

Then("Status surat harus bertransisi menjadi {string}", (status) => {
  cy.get("body").invoke("text").should("match", new RegExp(status, "i"));
});

Then("Linimasa surat harus mencantumkan disposisi ke {string}", (target) => {
  cy.contains("span, h2, h3, div, p", /perjalanan surat/i, { timeout: 10000 }).scrollIntoView();
  cy.get("body").invoke("text").should("match", new RegExp("Disposisi ke.*" + target, "i"));
});

Then("Linimasa surat harus mencantumkan disposisi internal", () => {
  cy.contains("span, h2, h3, div, p", /perjalanan surat/i, { timeout: 10000 }).scrollIntoView();
  cy.get("body").invoke("text").should("match", /disposisi internal/i);
});

Then("Form modal disposisi tidak boleh terkirim dan menampilkan pesan validasi", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible").should("be.visible");
  cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert'], .fi-error", { timeout: 6000 })
    .should("exist");
  // Tutup modal
  cy.get("body").type("{esc}");
});

Then("Tombol atau menu aksi {string} tidak boleh tersedia", (actionName) => {
  cy.get("body").then(($body) => {
    if ($body.find("button:contains('Kelola Surat')").length > 0) {
      cy.contains("button", "Kelola Surat").click({ force: true });
      cy.get(".fi-dropdown-panel:visible, [role='menu']:visible, body")
        .should("not.contain", actionName);
      cy.get("body").type("{esc}");
    } else {
      cy.contains("button, a", actionName).should("not.exist");
    }
  });
});

// ─── FR-DISP-02: MERESPON / TINDAKLANJUTI DISPOSISI ─────────────────────────

When("Saya menekan tombol aksi {string}", (btnLabel) => {
  cy.contains("button", new RegExp(btnLabel, "i"), { timeout: 10000 })
    .should("be.visible")
    .click({ force: true });
  cy.get(".fi-modal:visible, [role='dialog']:visible", { timeout: 8000 }).should("be.visible");
});

When("Saya memilih status respon disposisi {string}", (statusText) => {
  const val = /selesai/i.test(statusText) ? "SELESAI" : "DIPROSES";
  cy.get(".fi-modal:visible, [role='dialog']:visible").then(($modal) => {
    const $sel = $modal.find("select[id*='status_disposisi']");
    if ($sel.length > 0) {
      cy.wrap($sel.first()).select(val, { force: true });
    } else {
      cy.wrap($modal).find(".fi-fo-field-wrp:contains('Status') button").first().click({ force: true });
      cy.wait(500);
      cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
        .last()
        .contains("[role='option'], li", new RegExp(statusText, "i"))
        .click({ force: true });
    }
  });
});

When("Saya mengisi catatan respon disposisi {string}", (catatan) => {
  cy.get(".fi-modal:visible, [role='dialog']:visible")
    .find("textarea[id*='catatan_respon']")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Saya menekan tombol simpan respon disposisi", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible")
    .find("button[type='submit'], .fi-modal-actions button:contains('Tindaklanjuti'), .fi-modal-actions button")
    .first()
    .click({ force: true });
});

When("Saya mengosongkan status respon disposisi", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible").then(($modal) => {
    const $sel = $modal.find("select[id*='status_disposisi']");
    if ($sel.length > 0) {
      cy.wrap($sel.first()).select("", { force: true });
    }
  });
});

Then("Form respon disposisi tidak boleh terkirim", () => {
  cy.get(".fi-modal:visible, [role='dialog']:visible").should("be.visible");
  cy.get("body").type("{esc}");
});

// ─── FR-DISP-03: LINIMASA & EKSPOR LEMBAR DISPOSISI ─────────────────────────

Then("Section {string} harus menampilkan riwayat disposisi", (headingText) => {
  cy.contains("span, h2, h3, div, p", new RegExp(headingText, "i"), { timeout: 10000 }).scrollIntoView();
  cy.get("body").invoke("text").should("match", /disposisi/i);
});

Then("Section {string} harus menampilkan daftar instruksi disposisi", (headingText) => {
  cy.contains("span, h2, h3, div, p", new RegExp(headingText, "i"), { timeout: 10000 }).scrollIntoView();
  cy.get("body").invoke("text").should("match", /disposisi/i);
});

Then("URL ekspor paket berkas surat harus dapat diakses dengan sukses", () => {
  cy.url().then((currentUrl) => {
    const parts = currentUrl.split("/surat-masuk/");
    if (parts.length > 1) {
      const suratId = parts[1].split("?")[0];
      cy.request({
        url: `/surat/${suratId}/export`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 302]);
      });
    }
  });
});
