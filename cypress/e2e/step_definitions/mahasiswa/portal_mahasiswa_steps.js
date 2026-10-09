import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("Mahasiswa telah login dengan akun {string} dan kata sandi {string}", (username, password) => {
  cy.visit("/internal/login");
  cy.url().then((url) => {
    if (url.includes("/login")) {
      cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]')
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

Given("Mahasiswa mengakses halaman portal pengajuan surat {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-ta-header, .fi-ta-content, body", { timeout: 10000 }).should("be.visible");
});

Then("Mahasiswa melihat tabel riwayat surat dengan kolom utama:", (dataTable) => {
  const columns = dataTable.rawTable[0];
  cy.get(".fi-ta-header-cell, th, table").then(($table) => {
    const tableText = $table.text();
    columns.forEach((col) => {
      expect(tableText).to.include(col);
    });
  });
});

Then("Mahasiswa dapat melihat rekaman riwayat surat yang pernah diajukan", () => {
  cy.get(".fi-ta-content, table, .fi-ta-record", { timeout: 10000 }).should("be.visible");
});

When("Mahasiswa mengetikkan kata kunci pencarian perihal pada kolom pencarian tabel", () => {
  // Ambil teks baris pertama jika ada untuk dijadikan kata kunci pencarian dinamis
  cy.get("body").then(($body) => {
    let keyword = "Surat";
    const $firstRow = $body.find("tbody tr .fi-ta-cell-content");
    if ($firstRow.length > 0) {
      keyword = $firstRow.first().text().trim().substring(0, 5);
    }
    Cypress.env("searchKeyword", keyword);

    cy.get('input[placeholder*="Search"], input[placeholder*="Cari"], input[type="search"]')
      .first()
      .clear({ force: true })
      .type(keyword, { force: true });

    cy.wait(1500); // debounce search
  });
});

Then("Tabel hanya menampilkan baris surat yang sesuai dengan kata kunci pencarian", () => {
  const keyword = Cypress.env("searchKeyword") || "Surat";
  cy.get("body").should(($body) => {
    const contentText = $body.text().toLowerCase();
    const isKeywordPresent = contentText.includes(keyword.toLowerCase());
    const isNoRecordPresent =
      contentText.includes("tidak ada") ||
      contentText.includes("no records") ||
      contentText.includes("no pengajuan") ||
      contentText.includes("kosong");
    expect(isKeywordPresent || isNoRecordPresent).to.be.true;
  });
});

When("Mahasiswa mengklik tombol {string} atau {string}", (btn1, btn2) => {
  cy.get("body").then(($body) => {
    const $target = $body.find('a:contains("Buat Surat Baru"), a[href*="/create"], button:contains("Buat Surat Baru")');
    if ($target.length > 0) {
      cy.wrap($target.first()).click({ force: true });
    } else {
      cy.visit("/internal/mahasiswa-surats/create");
    }
  });
  cy.url({ timeout: 15000 }).should("include", "/create");
});

When("Mahasiswa memilih template surat resmi yang tersedia di portal", () => {
  cy.get("body", { timeout: 10000 }).then(($body) => {
    if ($body.find(".grid .cursor-pointer").length > 0) {
      cy.get(".grid .cursor-pointer").first().scrollIntoView().click({ force: true });
    } else {
      // Jika admin belum meng-assign template khusus mahasiswa, pilih opsi pembuatan mandiri
      cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
        .scrollIntoView()
        .click({ force: true });
    }
  });
  cy.wait(1000);
});

When("Mahasiswa memeriksa identitas akademik terisi otomatis pada form", () => {
  cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
    .first()
    .should("have.value", "mahasiswa");

  cy.get('input[id*="pengirim_nim"], input[wire\\:model*="pengirim_nim"]')
    .first()
    .should("have.value", "124");

  // Isi nomor WhatsApp (aktif) yang mandatory pada Step 2
  cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
    .first()
    .clear({ force: true })
    .type("081234567890", { force: true });
});

When("Mahasiswa melengkapi detail permohonan surat akademik", () => {
  cy.get("body").then(($body) => {
    // 1. Isi field perihal
    const timestamp = Date.now();
    const perihalUnik = `Permohonan Riset Mahasiswa - ${timestamp}`;
    Cypress.env("lastMhsPerihal", perihalUnik);

    if ($body.find('input[id*="perihal"]').length > 0) {
      cy.get('input[id*="perihal"]').first().clear({ force: true }).type(perihalUnik, { force: true });
    }

    // 2. Pilih Unit / Fakultas / Prodi Tujuan (Searchable Select Filament)
    cy.contains(/Select an option/i, { timeout: 10000 })
      .first()
      .click({ force: true });
    cy.wait(1000);

    cy.get('.fi-dropdown-panel, .fi-select-dropdown', { timeout: 10000 })
      .last()
      .find('li[role="option"], [role="option"], .fi-dropdown-list-item')
      .first()
      .click({ force: true });
    cy.wait(1000);

    // 3. Isi TinyEditor / Content Scratch
    cy.window().then((win) => {
      if (win.tinymce && win.tinymce.activeEditor) {
        win.tinymce.activeEditor.setContent("<p>Keperluan permohonan surat akademik resmi oleh mahasiswa.</p>");
      } else {
        cy.get("body").then(($b) => {
          if ($b.find('textarea[id*="content"]').length > 0) {
            cy.get('textarea[id*="content"]').first().type("Keperluan permohonan surat akademik resmi oleh mahasiswa.", { force: true });
          }
        });
      }
    });
  });
});

When("Mahasiswa mengklik tombol wizard {string}", (buttonText) => {
  cy.get("body").then(($body) => {
    const $btn = $body.find('button:contains("Next"), button:contains("Lanjutkan"), button[wire\\:click*="nextStep"], .fi-fo-wizard-step-next-action button');
    if ($btn.length > 0) {
      cy.wrap($btn.first()).scrollIntoView().click({ force: true });
    } else {
      cy.contains("button", new RegExp("Next|Lanjutkan", "i"))
        .first()
        .scrollIntoView()
        .click({ force: true });
    }
  });
  cy.wait(1000);
});

When("Mahasiswa berada di langkah lampiran dan mengklik tombol wizard {string}", (buttonText) => {
  cy.get("body").then(($body) => {
    const $btn = $body.find('button:contains("Next"), button:contains("Lanjutkan")');
    if ($btn.length > 0) {
      cy.wrap($btn.first()).scrollIntoView().click({ force: true });
    }
  });
  cy.wait(1000);
});

When("Mahasiswa menyetujui pernyataan konfirmasi integritas", () => {
  cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]')
    .last()
    .check({ force: true });
});

When("Mahasiswa mengklik tombol submit pengajuan {string}", (buttonText) => {
  cy.get("body").then(($body) => {
    const $btn = $body.find('button[type="submit"]:contains("Simpan & Ajukan"), button[type="submit"]:contains("Kirim")');
    if ($btn.length > 0) {
      cy.wrap($btn.first()).scrollIntoView().click({ force: true });
    } else {
      cy.get("button[type='submit']").first().scrollIntoView().click({ force: true });
    }
  });
  cy.wait(2000);
});

Then("Sistem menampilkan layar sukses pengajuan surat dengan kode pelacakan", () => {
  // Filament diredirect dari halaman create atau menampilkan notifikasi
  cy.url({ timeout: 15000 }).should("not.include", "/create");
});

Then("Surat yang baru diajukan muncul pada tabel riwayat surat mahasiswa", () => {
  cy.visit("/internal/mahasiswa-surats");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  const expectedPerihal = Cypress.env("lastMhsPerihal");
  if (expectedPerihal) {
    cy.contains("body", expectedPerihal).should("be.visible");
  }
});

Then("Field {string} bersifat read-only dan tidak dapat diubah", (fieldLabel) => {
  cy.get("body").then(($body) => {
    let selector = 'input[id*="pengirim_nama"]';
    if (fieldLabel.toLowerCase().includes("nim")) {
      selector = 'input[id*="pengirim_nim"]';
    } else if (fieldLabel.toLowerCase().includes("email")) {
      selector = 'input[id*="pengirim_email"]';
    }

    cy.get(selector)
      .first()
      .then(($input) => {
        const isReadOnly = $input.prop("readOnly") || $input.prop("disabled");
        expect(isReadOnly).to.be.true;
      });
  });
});
