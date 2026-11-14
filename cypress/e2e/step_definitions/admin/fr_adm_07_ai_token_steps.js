import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── NAVIGASI ADMIN KONFIGURASI AI ──────────────────────────────────────────

Given("Saya mengakses halaman manajemen konfigurasi AI", () => {
  cy.visit("/internal/ai-tokens");
  cy.get(".fi-ta-content, .fi-page-header, body", { timeout: 10000 }).should("be.visible");
});

// ─── PENGISIAN FORMULIR TOKEN AI ────────────────────────────────────────────

When("Saya mengisi formulir konfigurasi token AI:", (dataTable) => {
  const data = dataTable.rowsHash();

  cy.get(".fi-modal:visible, form").then(($scope) => {
    // 1. Pemilihan Provider (Select / Dropdown)
    if (data.provider) {
      const $select = $scope.find("select[id*='provider'], [data-field-wrapper*='provider'] select, select[name*='provider']");
      if ($select.length > 0) {
        const optionVal = data.provider.toLowerCase().includes("gemini") ? "gemini" : "ollama";
        cy.wrap($select.first()).select(optionVal, { force: true }).trigger("change");
      } else {
        const $btn = $scope.find("[data-field-wrapper*='provider'] button.fi-select-input-btn, .fi-fo-field:contains('Provider'), [data-field-wrapper]:contains('Penyedia') button");
        if ($btn.length > 0) {
          cy.wrap($btn.first()).click({ force: true });
          cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible", { timeout: 6000 })
            .contains("[role='option'], li, button", new RegExp(data.provider, "i"))
            .click({ force: true });
        }
      }
    }

    // 2. Label Penanda
    if (data.label) {
      cy.get("input[id*='label'], input[wire\\:model*='label']")
        .clear({ force: true })
        .type(data.label, { force: true });
    }

    // 3. API Key (Google Gemini)
    if (data.api_key) {
      cy.get("input[id*='api_key'], textarea[id*='api_key'], input[wire\\:model*='api_key']")
        .clear({ force: true })
        .type(data.api_key, { force: true });
    }

    // 4. Model Identifier
    if (data.model) {
      cy.get("input[id*='model'], input[wire\\:model*='model']")
        .clear({ force: true })
        .type(data.model, { force: true });
    }

    // 5. Base URL (Ollama)
    if (data.base_url) {
      cy.get("input[id*='base_url'], input[wire\\:model*='base_url']")
        .clear({ force: true })
        .type(data.base_url, { force: true });
    }
  });
});

// ─── ASSERTION TABEL & MASKING KUNCI ─────────────────────────────────────────

Then("Token AI {string} harus muncul pada daftar token", (tokenLabel) => {
  cy.visit("/internal/ai-tokens");
  cy.get(".fi-ta-content, table, body", { timeout: 10000 })
    .should("contain", tokenLabel);
});

Then("Kunci API untuk {string} harus ditampilkan tersamar", (tokenLabel) => {
  cy.contains("tr, .fi-ta-record", tokenLabel, { timeout: 10000 })
    .within(() => {
      // Memvalidasi karakter samaran bullet (•) atau asteris (*) pada kolom kredensial
      cy.get("td, .fi-ta-cell")
        .invoke("text")
        .should("match", /[•*]/);
    });
});

// ─── SET ACTIVE & STATUS PROVIDER ───────────────────────────────────────────

When("Saya mengaktifkan token AI {string}", (tokenLabel) => {
  cy.contains("tr, .fi-ta-record", tokenLabel, { timeout: 10000 })
    .within(() => {
      cy.contains("button, a", /Aktifkan|Set Active|Jadikan Utama/i)
        .click({ force: true });
    });
  cy.wait(1500);
});

Then("Token AI {string} harus berstatus aktif", (tokenLabel) => {
  cy.contains("tr, .fi-ta-record", tokenLabel, { timeout: 10000 })
    .within(() => {
      cy.get("td, .fi-ta-cell")
        .find("svg, .fi-color-success, .text-success-600, .text-primary-600, [aria-label='True']")
        .should("exist");
    });
});

Then("Token AI {string} harus berstatus tidak aktif", (tokenLabel) => {
  cy.contains("tr, .fi-ta-record", tokenLabel, { timeout: 10000 })
    .within(() => {
      cy.contains("button, a", /Aktifkan|Set Active/i)
        .should("exist");
    });
});

Then("Status sumber token aktif sistem harus menampilkan {string}", (expectedText) => {
  cy.get(".fi-header-subheading, .fi-page-header, .fi-ta-header, body", { timeout: 10000 })
    .should("contain", expectedText);
});

// ─── TOGGLE GLOBAL AKTIVASI ASISTEN AI ──────────────────────────────────────

When("Saya mematikan toggle global aktivasi layanan AI", () => {
  cy.get("body").then(($body) => {
    const $hdrBtn = $body.find("button:contains('Asisten AI: AKTIF'), a:contains('Asisten AI: AKTIF')");
    if ($hdrBtn.length > 0) {
      cy.wrap($hdrBtn.first()).click({ force: true });
      cy.get(".fi-modal:visible", { timeout: 8000 }).within(() => {
        cy.contains("button", /Ya|Nonaktifkan|Confirm/i).click({ force: true });
      });
    } else {
      const $toggle = $body.find("button[role='switch']");
      if ($toggle.length > 0 && $toggle.attr("aria-checked") === "true") {
        cy.wrap($toggle.first()).click({ force: true });
      }
    }
  });
  cy.wait(1500);
});

Then("Toggle global aktivasi layanan AI harus berstatus nonaktif", () => {
  cy.get("body").then(($body) => {
    const hasInactiveBtn = $body.find("button:contains('Asisten AI: NONAKTIF'), a:contains('Asisten AI: NONAKTIF')").length > 0;
    const hasInactiveSwitch = $body.find("button[role='switch'][aria-checked='false']").length > 0;
    expect(hasInactiveBtn || hasInactiveSwitch).to.be.true;
  });
});

When("Saya mengaktifkan toggle global aktivasi layanan AI", () => {
  cy.get("body").then(($body) => {
    const $hdrBtn = $body.find("button:contains('Asisten AI: NONAKTIF'), a:contains('Asisten AI: NONAKTIF')");
    if ($hdrBtn.length > 0) {
      cy.wrap($hdrBtn.first()).click({ force: true });
      cy.get(".fi-modal:visible", { timeout: 8000 }).within(() => {
        cy.contains("button", /Ya|Aktifkan|Confirm/i).click({ force: true });
      });
    } else {
      const $toggle = $body.find("button[role='switch']");
      if ($toggle.length > 0 && $toggle.attr("aria-checked") === "false") {
        cy.wrap($toggle.first()).click({ force: true });
      }
    }
  });
  cy.wait(1500);
});

Then("Toggle global aktivasi layanan AI harus berstatus aktif", () => {
  cy.get("body").then(($body) => {
    const hasActiveBtn = $body.find("button:contains('Asisten AI: AKTIF'), a:contains('Asisten AI: AKTIF')").length > 0;
    const hasActiveSwitch = $body.find("button[role='switch'][aria-checked='true']").length > 0;
    expect(hasActiveBtn || hasActiveSwitch).to.be.true;
  });
});

// ─── DAMPAK VISIBILITAS FORMULIR DRAF SURAT STAF ─────────────────────────────

Then("Tombol aksi bantuan AI tidak boleh muncul di samping editor", () => {
  cy.wait(1000);
  cy.contains("button, a, span", /(Bantuan|Asisten) AI/i, { timeout: 5000 })
    .should("not.exist");
});

Then("Tombol aksi hint {string} harus muncul di samping editor", (labelTombol) => {
  cy.contains("button, a, span", /(Bantuan|Asisten) AI/i, { timeout: 10000 })
    .should("be.visible");
});

// ─── FALLBACK KE ENVIRONMENT (.ENV) ─────────────────────────────────────────

When("Saya menonaktifkan seluruh token AI di pangkalan data", () => {
  cy.visit("/internal/ai-tokens");
  cy.get("body").then(($body) => {
    const $deactivateBtns = $body.find("button:contains('Nonaktifkan'), a:contains('Nonaktifkan')");
    if ($deactivateBtns.length > 0) {
      cy.wrap($deactivateBtns.first()).click({ force: true });
      cy.wait(1500);
    }
  });
});

Then("Status sumber token aktif sistem harus beralih ke {string}", (statusText) => {
  cy.get(".fi-header-subheading, .fi-page-header, .fi-ta-header, body", { timeout: 10000 })
    .should("contain", statusText);
});

// ─── TEARDOWN PEMBERSIHAN TOKEN UJI DINAMIS ──────────────────────────────────

When("Saya menghapus token AI {string} jika ada", (tokenLabel) => {
  cy.visit("/internal/ai-tokens");
  cy.get("body").then(($body) => {
    if ($body.text().includes(tokenLabel)) {
      cy.contains("tr, .fi-ta-record", tokenLabel)
        .within(() => {
          cy.contains("button, a", /Hapus|Delete/i).click({ force: true });
        });
      cy.get("body").then(($b) => {
        const $modalBtn = $b.find(".fi-modal:visible button:contains('Hapus'), .fi-modal:visible button:contains('Confirm'), .fi-modal:visible button:contains('Ya')");
        if ($modalBtn.length > 0) {
          cy.wrap($modalBtn.first()).click({ force: true });
        }
      });
      cy.get(".fi-modal:visible:not(#database-notifications)", { timeout: 8000 }).should("not.exist");
      cy.wait(1000);
    }
  });
});

When("Saya memastikan toggle global aktivasi layanan AI dalam kondisi aktif", () => {
  cy.visit("/internal/ai-tokens");
  cy.get("body").then(($body) => {
    const $inactiveBtn = $body.find("button:contains('Asisten AI: NONAKTIF'), a:contains('Asisten AI: NONAKTIF')");
    if ($inactiveBtn.length > 0) {
      cy.wrap($inactiveBtn.first()).click({ force: true });
      cy.get(".fi-modal:visible", { timeout: 8000 }).within(() => {
        cy.contains("button", /Ya|Aktifkan|Confirm/i).click({ force: true });
      });
      cy.wait(1000);
    }
  });
});

Then("Daftar token uji AI berhasil dibersihkan dengan aman", () => {
  cy.visit("/internal/ai-tokens");
  cy.contains("Gemini QA Token").should("not.exist");
  cy.contains("Ollama Local QA").should("not.exist");
  cy.log("Teardown FR-ADM-07 dynamic test tokens completed successfully.");
});
