import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("Pengguna membuka halaman pengajuan surat publik {string}", (url) => {
  cy.visit(url);
  cy.get("body").should("be.visible");
});

When("Pengguna memilih opsi pembuatan surat {string}", (option) => {
  if (option.toLowerCase() === "scratch") {
    // Scroll ke bagian bawah tempat opsi mandiri berada
    cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
  } else {
    // Memilih kartu template tertentu
    cy.contains(new RegExp(option, "i"), { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
  }
});

When("Pengguna mengklik tombol wizard {string}", (buttonText) => {
  cy.get("button")
    .contains(new RegExp(`^\\s*${buttonText}\\s*$`, "i"))
    .first()
    .click({ force: true });
  cy.wait(1000); // Beri jeda roundtrip Livewire
});

When("Pengguna mengisi identitas pengirim guest:", (dataTable) => {
  const data = dataTable.hashes()[0];

  if (data.nama) {
    cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
      .first()
      .clear({ force: true })
      .type(data.nama, { force: true });
  }

  if (data.email) {
    cy.get('input[id*="pengirim_email"], input[wire\\:model*="pengirim_email"]')
      .first()
      .clear({ force: true })
      .type(data.email, { force: true });
  }

  if (data.telp) {
    cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
      .first()
      .clear({ force: true })
      .type(data.telp, { force: true });
  }

  if (data.instansi) {
    cy.get('input[id*="pengirim_instansi"], input[wire\\:model*="pengirim_instansi"]')
      .first()
      .clear({ force: true })
      .type(data.instansi, { force: true });
  }
});

When("Pengguna mengosongkan seluruh field identitas pengirim", () => {
  cy.get('input[id*="pengirim_nama"]').clear({ force: true });
  cy.get('input[id*="pengirim_email"]').clear({ force: true });
  cy.get('input[id*="pengirim_telp"]').clear({ force: true });
  cy.get('input[id*="pengirim_instansi"]').clear({ force: true });
});

When("Pengguna mengisi detail isi surat pengajuan:", (dataTable) => {
  const data = dataTable.hashes()[0];

  // Pilih radio tipe surat jika tersedia
  if (data.tipe_surat) {
    cy.get('input[type="radio"]')
      .filter(`[value="${data.tipe_surat}"]`)
      .check({ force: true });
  }

  // Pilih Unit Tujuan dari dropdown
  if (data.unit_tujuan) {
    cy.get('body').then(($body) => {
      if ($body.find('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').length > 0) {
        cy.get('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]')
          .first()
          .select(1, { force: true });
      } else {
        cy.contains('label', /Unit Tujuan/i)
          .parent()
          .find('select, input, button')
          .first()
          .then(($el) => {
            if ($el.is('select')) {
              cy.wrap($el).select(1, { force: true });
            } else {
              cy.wrap($el).click({ force: true });
              cy.wait(500);
              cy.get('li[role="option"]').first().click({ force: true });
            }
          });
      }
    });
  }

  // Isi perihal (Subjek / Judul)
  if (data.perihal) {
    const timestamp = new Date().getTime();
    const perihalUnik = `${data.perihal} - ${timestamp}`;
    cy.get('input[id*="perihal"], input[wire\\:model*="perihal"]')
      .first()
      .clear({ force: true })
      .type(perihalUnik, { force: true });
  }

  // Isi TinyEditor / Content Scratch
  cy.wait(1000);
  cy.window().then((win) => {
    if (win.tinymce && win.tinymce.activeEditor) {
      win.tinymce.activeEditor.setContent("<p>Isi surat permohonan resmi otomatis oleh Cypress.</p>");
    } else {
      cy.get("body").then(($body) => {
        if ($body.find('iframe[id*="content_scratch"]').length > 0) {
          cy.get('iframe[id*="content_scratch"]')
            .its("0.contentDocument.body")
            .should("not.be.empty")
            .then(cy.wrap)
            .clear({ force: true })
            .type("Isi surat pengujian otomatis via TinyEditor iframe", { force: true });
        } else if ($body.find('textarea[id*="content_scratch"]').length > 0) {
          cy.get('textarea[id*="content_scratch"]').type("Isi surat pengujian otomatis", { force: true });
        }
      });
    }
  });
});

When("Pengguna berada di langkah lampiran dan mengklik tombol wizard {string}", (buttonText) => {
  cy.get("button")
    .contains(new RegExp(`^\\s*${buttonText}\\s*$`, "i"))
    .first()
    .click({ force: true });
  cy.wait(1000);
});

When("Pengguna menyetujui pernyataan konfirmasi integritas", () => {
  cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]')
    .last()
    .check({ force: true });
});

When("Pengguna mengklik tombol submit pengajuan {string}", (buttonText) => {
  cy.get("button[type='submit']")
    .contains(new RegExp(buttonText, "i"))
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan layar sukses pengajuan surat", () => {
  cy.contains(/Surat Berhasil Dikirim/i, { timeout: 15000 }).should("be.visible");
});

Then("Sistem menampilkan kode pelacakan unik berformat {string}", (prefix) => {
  cy.get("span.font-mono.font-black, [class*='font-mono'][class*='font-black']", { timeout: 10000 })
    .should("be.visible")
    .invoke("text")
    .then((text) => {
      const code = text.trim();
      expect(code).to.contain(prefix);
      Cypress.env("lastTrackingCode", code);
    });
});

Then("Sistem menyimpan kode pelacakan ke dalam fixture {string}", (fixtureFileName) => {
  const code = Cypress.env("lastTrackingCode");
  if (code) {
    cy.writeFile(`cypress/fixtures/${fixtureFileName}`, { tracking_code: code });
  } else {
    cy.get("span.font-mono.font-black")
      .invoke("text")
      .then((text) => {
        const cleanCode = text.trim();
        cy.writeFile(`cypress/fixtures/${fixtureFileName}`, { tracking_code: cleanCode });
      });
  }
});

Then("Sistem menampilkan pesan validasi error pada form pengirim", () => {
  // Filament error wrapper / HTML5 validation message
  cy.get("body").should(($body) => {
    const hasError =
      $body.find(".fi-fo-field-wrp-error-message, .text-danger-600, p[class*='danger'], [class*='text-danger']").length > 0 ||
      $body.find(":invalid").length > 0;
    expect(hasError).to.be.true;
  });
});

Then("Form pengajuan tetap berada pada langkah data pengirim", () => {
  // Memastikan field pengirim tetap terlihat di layar
  cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
    .first()
    .should("be.visible");
});

Then("Sistem mencegah navigasi ke langkah berikutnya", () => {
  // Form tidak berpindah ke step 3 (Isi Surat)
  cy.get('input[id*="pengirim_nama"]').should("be.visible");
});
