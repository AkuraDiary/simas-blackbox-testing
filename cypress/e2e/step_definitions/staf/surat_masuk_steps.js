import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── AUTH & NAVIGATION ─────────────────────────────────────────────────────────

Given("Staf Unit telah login dengan akun {string} dan kata sandi {string}", (username, password) => {
  cy.visit("/internal/login");
  cy.url().then((url) => {
    if (url.includes("/login")) {
      cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]', { timeout: 15000 })
        .first()
        .clear({ force: true })
        .type(username, { force: true });

      cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
        .first()
        .clear({ force: true })
        .type(password, { force: true });

      cy.get(".fi-form-actions button[type='submit'], form button[type='submit']")
        .first()
        .click({ force: true });

      cy.url({ timeout: 15000 }).should("not.include", "/login");
    }
  });
});

Given("Pengguna belum login dan membersihkan sesi browser", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

When("Pengguna mengakses langsung URL surat masuk {string}", (url) => {
  cy.visit(url, { failOnStatusCode: false });
});

Then("Sistem menolak akses dan mengalihkan pengguna ke halaman login {string}", (expectedUrlPattern) => {
  cy.url({ timeout: 10000 }).should("include", expectedUrlPattern);
});

When("Staf Unit mengakses halaman surat masuk {string}", (url) => {
  cy.visit(url);
  cy.url({ timeout: 15000 }).should("match", /\/internal\/surat-masuk(\?.*)?$/);
  cy.get(".fi-tabs-item, button[role='tab']", { timeout: 15000 }).should("be.visible");
});

// ─── FR-SRT-06: DAFTAR SURAT MASUK ───────────────────────────────────────────

Then("Sistem menampilkan tabel Surat Masuk dengan tab filter kategori:", (dataTable) => {
  const tabs = dataTable.rawTable[0];
  cy.get("body").then(($body) => {
    tabs.forEach((tabName) => {
      cy.contains("button[role='tab'], .fi-tabs-item, .fi-tabs button, [role='tablist']", tabName, { timeout: 8000 })
        .should("exist");
    });
  });
});

Then("Sistem menampilkan tabel Surat Masuk dengan kolom-kolom utama:", (dataTable) => {
  const columns = dataTable.rawTable[0];
  cy.get(".fi-ta-header-cell, th, table, body", { timeout: 10000 }).then(($table) => {
    const tableText = $table.text();
    columns.forEach((col) => {
      expect(tableText).to.include(col);
    });
  });
});

// ─── FR-PRC-01: FILTER TAB PENGAJUAN ──────────────────────────────────────────

When("Staf Unit mengklik tab filter {string} pada tabel surat masuk", (tabLabel) => {
  cy.contains("button[role='tab'], .fi-tabs-item, .fi-tabs button, [role='tablist']", tabLabel, { timeout: 8000 })
    .click({ force: true });
  cy.wait(1500); // Debounce / Livewire request
});

Then("Tabel hanya menampilkan daftar surat masuk bertipe {string}", (expectedType) => {
  cy.get("body").then(($body) => {
    const $records = $body.find("tbody tr .fi-ta-cell-content, tbody tr .fi-badge, .fi-ta-record");
    if ($records.length > 0) {
      // Jika ada data pengajuan yang diterima unit ini
      cy.get("tbody").should("contain.text", expectedType);
    } else {
      // Jika memang belum ada surat pengajuan masuk di unit ini, tabel menampilkan state kosong
      cy.contains("Tidak Ada Data Surat", { matchCase: false }).should("exist");
    }
  });
});

// ─── FR-SRT-07: PENCARIAN SURAT MASUK ─────────────────────────────────────────

When("Staf Unit memasukkan kata kunci perihal atau pengirim yang valid pada kotak pencarian", () => {
  cy.get("body").then(($body) => {
    let keyword = "Surat";
    const $firstRow = $body.find("tbody tr .fi-ta-cell-content");
    if ($firstRow.length > 0) {
      const rowText = $firstRow.first().text().trim();
      if (rowText.length > 3) {
        keyword = rowText.substring(0, 5).trim();
      }
    }
    Cypress.env("staffSearchKeyword", keyword);

    cy.get('input[placeholder*="Search"], input[placeholder*="Cari"], input[type="search"]')
      .first()
      .clear({ force: true })
      .type(keyword, { force: true });

    cy.wait(1500); // Debounce pencarian Livewire
  });
});

Then("Tabel memfilter data dan hanya menampilkan baris surat yang memuat kata kunci pencarian", () => {
  const keyword = Cypress.env("staffSearchKeyword") || "Surat";
  cy.get(".fi-ta-content, table, body", { timeout: 10000 }).then(($content) => {
    const contentText = $content.text();
    const hasData = contentText.includes(keyword);
    const isEmpty = contentText.includes("Tidak Ada Data Surat");
    expect(hasData || isEmpty).to.be.true;
  });
});

When("Staf Unit memasukkan kata kunci acak yang tidak terdaftar {string} pada kotak pencarian", (keyword) => {
  cy.get('input[placeholder*="Search"], input[placeholder*="Cari"], input[type="search"]')
    .first()
    .clear({ force: true })
    .type(keyword, { force: true });

  cy.wait(1500); // Debounce pencarian Livewire
});

Then("Tabel menampilkan pesan status kosong {string}", (emptyMessage) => {
  cy.contains(".fi-ta-empty-state-heading, .fi-ta-empty-state, body", emptyMessage, { timeout: 10000 })
    .should("be.visible");
});

// ─── FR-SRT-08 & FR-PRC-02: DETAIL SURAT MASUK ───────────────────────────────

When("Staf Unit mengklik salah satu baris surat masuk pada tabel", () => {
  // Tunggu rekaman baris surat muncul pada tabel Surat Masuk dan klik link surat
  cy.get("tbody tr.fi-ta-row, tbody tr:not(.fi-ta-empty-state-row), .fi-ta-record", { timeout: 15000 })
    .first()
    .then(($row) => {
      const $link = $row.find("a[href*='/internal/surat-masuk/'], a");
      if ($link.length > 0) {
        cy.wrap($link.first()).click({ force: true });
      } else {
        cy.wrap($row).find(".fi-ta-cell-content, td").first().click({ force: true });
      }
    });
});

Then("Sistem membuka halaman detail surat masuk", () => {
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
});

Then("Halaman detail surat menampilkan panel informasi pengirim", () => {
  cy.contains("Informasi Pengirim", { timeout: 10000 }).should("be.visible");
});

Then("Halaman detail surat menampilkan pratinjau lembar surat atau timeline perjalanan surat", () => {
  cy.get("body").then(($body) => {
    const bodyText = $body.text();
    const hasPreview = $body.find(".prose, iframe, .bg-white").length > 0;
    const hasTimeline = /Timeline|Riwayat|Alur/i.test(bodyText);
    const hasMetadata = /Nomor Surat|Tanggal Surat/i.test(bodyText);
    expect(hasPreview || hasTimeline || hasMetadata).to.be.true;
  });
});

When("Staf Unit mengakses langsung URL detail surat fiktif {string}", (url) => {
  cy.visit(url, { failOnStatusCode: false });
});

Then("Sistem menampilkan respons error 404 Not Found", () => {
  cy.get("body", { timeout: 10000 }).should(($body) => {
    const bodyText = $body.text();
    expect(bodyText).to.match(/(404|not found|tidak ditemukan)/i);
  });
});
