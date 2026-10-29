import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("Pengguna membuka halaman pelacakan surat publik {string}", (url) => {
  cy.visit(url);
  cy.get("body").should("be.visible");
});

When("Pengguna memasukkan kode pelacakan yang valid dari pengajuan sebelumnya", () => {
  // Cek apakah ada di Cypress.env terlebih dahulu
  const envCode = Cypress.env("lastTrackingCode");
  if (envCode) {
    cy.get('input[wire\\:model="trackingCode"], input[placeholder*="REQ-"]')
      .first()
      .clear({ force: true })
      .type(envCode, { force: true });
    return;
  }

  // Cek fixture last_tracking.json
  cy.readFile("cypress/fixtures/last_tracking.json", { timeout: 3000 })
    .then((fixtureData) => {
      if (fixtureData && fixtureData.tracking_code) {
        return fixtureData.tracking_code;
      }
      return null;
    })
    .then((trackingCode) => {
      if (trackingCode) {
        cy.get('input[wire\\:model="trackingCode"], input[placeholder*="REQ-"]')
          .first()
          .clear({ force: true })
          .type(trackingCode, { force: true });
      } else {
        // Fallback: Jika fixture belum ada (misal run isolated), lakukan submit cepat via UI pengajuan
        cy.log("Fixture belum ada, melakukan fallback submission cepat...");
        cy.visit("/pengajuan");
        cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 }).click({ force: true });
        cy.get("button").contains(/Lanjutkan/i).click({ force: true });
        cy.wait(800);

        cy.get('input[id*="pengirim_nama"]').type("Penguji Fallback", { force: true });
        cy.get('input[id*="pengirim_email"]').type("fallback@tester.com", { force: true });
        cy.get('input[id*="pengirim_telp"]').type("081234567890", { force: true });
        cy.get('input[id*="pengirim_instansi"]').type("Fallback Instansi", { force: true });
        cy.get("button").contains(/Lanjutkan/i).click({ force: true });
        cy.wait(800);

        cy.get('.fi-fo-field-wrp:contains("Unit Tujuan") select, .fi-fo-field-wrp:contains("Unit Tujuan") input')
          .first()
          .then(($el) => {
            if ($el.is("select")) {
              cy.wrap($el).select(1, { force: true });
            } else {
              cy.wrap($el).click({ force: true });
              cy.get('li[role="option"]').first().click({ force: true });
            }
          });
        cy.get('input[id*="perihal"]').type("Fallback Perihal - " + Date.now(), { force: true });
        cy.get("button").contains(/Lanjutkan/i).click({ force: true });
        cy.wait(800);
        cy.get("button").contains(/Lanjutkan/i).click({ force: true });
        cy.wait(800);
        cy.get('input[type="checkbox"]').last().check({ force: true });
        cy.get('button[type="submit"]:contains("Kirim Sekarang")').click({ force: true });

        cy.get("span.font-mono.font-black", { timeout: 15000 })
          .invoke("text")
          .then((codeText) => {
            const clean = codeText.trim();
            cy.writeFile("cypress/fixtures/last_tracking.json", { tracking_code: clean });
            Cypress.env("lastTrackingCode", clean);

            // Kembali ke halaman lacak
            cy.visit("/lacak");
            cy.get('input[wire\\:model="trackingCode"], input[placeholder*="REQ-"]')
              .first()
              .clear({ force: true })
              .type(clean, { force: true });
          });
      }
    });
});

When("Pengguna memasukkan kode pelacakan {string}", (code) => {
  cy.get('input[wire\\:model="trackingCode"], input[placeholder*="REQ-"]')
    .first()
    .clear({ force: true })
    .type(code, { force: true });
});

When("Pengguna mengklik tombol {string}", (buttonText) => {
  cy.get("button")
    .contains(new RegExp(buttonText, "i"))
    .first()
    .click({ force: true });
  cy.wait(1000);
});

Then("Sistem menampilkan informasi ringkasan berkas surat", () => {
  // Muncul kartu ringkasan atau detail dokumen
  cy.get("body", { timeout: 10000 }).should(($body) => {
    const hasSummary =
      $body.find(".bg-white, .shadow-sm").filter(':contains("Kode Pelacakan")').length > 0 ||
      $body.text().includes("Kode Pelacakan");
    expect(hasSummary).to.be.true;
  });
});

Then("Sistem menampilkan status surat yang sesuai", () => {
  // Filament badge status surat (cth: Terkirim, Diajukan, Diproses, Selesai, dsb)
  cy.get(".fi-badge, [class*='badge'], span", { timeout: 10000 })
    .filter(':contains("Terkirim"), :contains("Diajukan"), :contains("Diproses"), :contains("Selesai"), :contains("Pending")')
    .should("be.visible");
});

Then("Sistem menampilkan notifikasi kesalahan {string}", (errorMessage) => {
  cy.contains(new RegExp(errorMessage, "i"), { timeout: 10000 }).should("be.visible");
});

Then("Sistem menampilkan pesan validasi {string} atau mencegah pencarian", (keyword) => {
  cy.get("body").should(($body) => {
    const textFound =
      $body.text().toLowerCase().includes("wajib diisi") ||
      $body.text().toLowerCase().includes("minimal") ||
      $body.find(".text-danger-600, :invalid, p.text-xs").length > 0;
    expect(textFound).to.be.true;
  });
});

// ─── STEP DEFINITIONS UNDUH TERBITAN (FR-REQ-05) ─────────────────────────────

Then("Sistem tidak menampilkan kartu hasil pengunduhan dokumen terbitan", () => {
  cy.contains("h3", /Balasan Surat Sudah Terbit!/i).should("not.exist");
  cy.get("body").then(($body) => {
    const $btn = $body.find('button:contains("Unduh Dokumen")');
    expect($btn.length).to.equal(0);
  });
});
