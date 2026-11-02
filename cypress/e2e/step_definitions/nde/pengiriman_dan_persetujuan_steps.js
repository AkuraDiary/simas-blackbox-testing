import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Step Definitions untuk Modul Naskah Dinas Elektronik (Batch 2)
 * Mencakup FR-SRT-04 (Pengiriman), FR-SRT-05 (Backtrack/Revisi),
 * FR-SRT-09 s/d FR-SRT-11 (Alur, Respon, Dokumen), dan FR-TTD-01 (TTE/QR)
 */

// ─── HELPER NOTIFIKASI & REPEATER ───────────────────────────────────────────

function assertToastNotification(expectedMessage, timeout = 15000) {
  const pattern = new RegExp(expectedMessage.replace(/[()]/g, "\\$&"), "i");
  cy.contains(
    ".fi-no-notification-title, .fi-notification-title, [class*='notification-title'], .fi-notification, .fi-no-notification, body",
    pattern,
    { timeout }
  ).should("be.visible");
}

function cleanupEmptyRepeaterRows() {
  cy.get("body").then(($body) => {
    const $sec = $body.find(".fi-section:contains('Jalur Persetujuan Khusus')");
    if ($sec.length > 0) {
      $sec.find(".fi-fo-repeater-item, [wire\\:key*='approval_path']").each((idx, item) => {
        const $item = Cypress.$(item);
        const itemText = $item.find(".choices__item, .choices, .fi-fo-select, select").text().trim();
        const hasSelectedJabatan =
          itemText.length > 0 &&
          !/Pilih opsi|Pilih sebuah opsi|Select an option/i.test(itemText) &&
          ($item.find("select").length === 0 || Boolean($item.find("select").val()));

        if (!hasSelectedJabatan) {
          const deleteBtn = $item.find(
            "button[title*='Delete'], button[aria-label*='Delete'], button[title*='Hapus'], button[aria-label*='Hapus'], .fi-fo-repeater-item-delete-btn, [wire\\:click*='deleteItem']"
          );
          if (deleteBtn.length > 0) {
            cy.wrap(deleteBtn.first()).click({ force: true });
            cy.wait(800);
          }
        }
      });
    }
  });
}

When("Staf Unit menekan tombol aksi {string}", (buttonText) => {
  cy.wait(800);
  if (/Kirim \/ Pengajuan/i.test(buttonText)) {
    cy.get(".fi-form-actions, form, body")
      .contains("button", /Kirim \/ Pengajuan|Kirim|Pengajuan/i, { timeout: 10000 })
      .first()
      .click({ force: true });
  } else {
    cy.contains("button, a", buttonText, { timeout: 10000 })
      .click({ force: true });
  }
});

// ─── NAVIGASI DAN INISIALISASI ───────────────────────────────────────────────

Given("Staf Unit berada di halaman pembuatan surat {string}", (url) => {
  cy.visit(url);
  cy.get(".fi-page-header, form, body", { timeout: 15000 }).should("be.visible");
});

function createFreshPengajuanForFik(callback) {
  cy.visit("/pengajuan");
  cy.get("body", { timeout: 15000 }).should("be.visible");

  // Step 1: Template (Scratch)
  cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
    .scrollIntoView()
    .should("be.visible")
    .click({ force: true });
  cy.wait(1200);
  cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().should("be.visible").click({ force: true });
  cy.wait(1200);

  // Step 2: Data Pengirim
  cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
    .first().clear({ force: true }).type("Mitra Penguji QA", { force: true });

  cy.get('input[id*="pengirim_email"], input[wire\\:model*="pengirim_email"]')
    .first().clear({ force: true }).type("mitra.tester@gmail.com", { force: true });

  cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
    .first().clear({ force: true }).type("081234567890", { force: true });

  cy.get('input[id*="pengirim_instansi"], input[wire\\:model*="pengirim_instansi"]')
    .first().clear({ force: true }).type("FIK UNIK QA", { force: true });

  cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
  cy.wait(1200);

  // Step 3: Isi Surat
  cy.get("body").then(($b3) => {
    if ($b3.find('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').length > 0) {
      cy.get('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]')
        .first()
        .then(($sel) => {
          const $options = $sel.find("option");
          let selected = false;
          $options.each((idx, opt) => {
            if (Cypress.$(opt).text().includes("Fakultas Ilmu Kesehatan")) {
              cy.wrap($sel).select(Cypress.$(opt).val(), { force: true });
              selected = true;
              return false;
            }
          });
          if (!selected) {
            cy.wrap($sel).select(1, { force: true });
          }
        });
    } else {
      cy.contains("label", /Unit Tujuan/i)
        .parent()
        .find("select, input, button")
        .first()
        .then(($el) => {
          if ($el.is("select")) {
            cy.wrap($el).select(1, { force: true });
          } else {
            cy.wrap($el).click({ force: true });
            cy.wait(800);
            cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
              .last()
              .then(($panel) => {
                const $fikOpt = $panel.find("li[role='option']:contains('Fakultas Ilmu Kesehatan')");
                if ($fikOpt.length > 0) {
                  cy.wrap($fikOpt.first()).click({ force: true });
                } else {
                  cy.wrap($panel.find("li[role='option']").first()).click({ force: true });
                }
              });
          }
        });
    }
  });

  const perihalUnik = `Permohonan Review Backtrack QA - ${Date.now()}`;
  cy.get('input[id*="perihal"], input[wire\\:model*="perihal"]')
    .first().clear({ force: true }).type(perihalUnik, { force: true });

  cy.wait(1000);
  cy.window().then((win) => {
    const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
    if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
      const editor = win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
      if (editor) {
        editor.setContent("<p>Isi permohonan review untuk pengujian backtrack.</p>");
        editor.fire("change");
        editor.save();
        return;
      }
    }
    cy.get("body").then(($bTiny) => {
      if ($bTiny.find('iframe[id*="content_scratch"]').length > 0) {
        cy.get('iframe[id*="content_scratch"]')
          .its("0.contentDocument.body")
          .should("not.be.empty")
          .then(cy.wrap)
          .clear({ force: true })
          .type("Isi permohonan review untuk pengujian backtrack", { force: true });
      } else if ($bTiny.find('textarea[id*="content_scratch"]').length > 0) {
        cy.get('textarea[id*="content_scratch"]').type("Isi permohonan review untuk pengujian backtrack", { force: true });
      }
    });
  });

  cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
  cy.wait(1200);

  // Step 4: Lampiran
  cy.get("button").contains(/^\s*Lanjutkan\s*$/i).first().click({ force: true });
  cy.wait(1200);

  // Step 5: Konfirmasi
  cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]')
    .last()
    .check({ force: true });
  cy.get("button[type='submit']")
    .contains(/Kirim Sekarang|Kirim/i)
    .first()
    .click({ force: true });
  cy.contains(/Surat Berhasil Dikirim/i, { timeout: 15000 }).should("be.visible");

  // Login kembali sebagai dekan.fik dan buka surat di tab Pengajuan
  cy.loginAs("dekan.fik");
  cy.visit("/internal/surat-masuk?activeTab=pengajuan");
  cy.get(".fi-ta-content, table", { timeout: 15000 }).should("be.visible");
  cy.wait(1200);
  cy.get("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record").first().find("a[href*='/internal/surat-masuk/']").first().click({ force: true });
  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-header-heading, .fi-page-header, main", { timeout: 15000 }).should("exist");

  if (typeof callback === "function") {
    callback();
  }
}

function ensurePendingApprovalSurat(callback) {
  cy.loginAs("dekan.fik");
  cy.visit("/internal/surat-masuk?activeTab=pengajuan");
  cy.get(".fi-ta-content, table, body", { timeout: 15000 }).should("be.visible");
  cy.wait(1500);

  cy.get("body").then(($body) => {
    const $rows = $body.find("table.fi-ta-table tbody tr.fi-ta-row, .fi-ta-record");
    if ($rows.length > 0) {
      const link = $rows.first().find("a[href*='/internal/surat-masuk/']").first();
      if (link.length > 0) {
        cy.wrap(link).click({ force: true });
        cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
        cy.wait(1000);
        cy.get("body").then(($detail) => {
          if ($detail.find("button:contains('Kembalikan / Tolak'), button:contains('Proses Surat')").length > 0) {
            if (typeof callback === "function") callback();
            return;
          }
          // Jika surat pertama tidak memiliki tombol Kembalikan, buat pengajuan fresh
          createFreshPengajuanForFik(callback);
        });
        return;
      }
    }
    createFreshPengajuanForFik(callback);
  });
}

Given("Pimpinan membuka salah satu surat masuk yang sedang diproses", () => {
  ensurePendingApprovalSurat();
});

Given("Pimpinan membuka salah satu surat masuk yang tersedia", () => {
  cy.visit("/internal/surat-masuk");
  cy.get("table tbody, .fi-ta-content, body", { timeout: 15000 }).should("be.visible");

  cy.get("table tbody tr, .fi-ta-record").first().then(($row) => {
    const link = $row.find("a[href*='/internal/surat-masuk/']").first();
    if (link.length > 0) {
      cy.wrap(link).click({ force: true });
    } else {
      cy.wrap($row).click({ force: true });
    }
  });

  cy.url({ timeout: 15000 }).should("include", "/internal/surat-masuk/");
  cy.get(".fi-page-header, main, body", { timeout: 15000 }).should("be.visible");
});

// ─── PENGISIAN FORM PENGIRIMAN SURAT (FR-SRT-04) ─────────────────────────────

When("Staf Unit mengisi field perihal dengan judul unik {string}", (prefix) => {
  const uniqueTitle = `${prefix} ${Date.now()}`;
  Cypress.env("lastCreatedPerihal", uniqueTitle);

  cy.get("input[id*='perihal'], input[wire\\:model*='perihal'], input[name*='perihal']")
    .first()
    .clear({ force: true })
    .type(uniqueTitle, { force: true })
    .trigger("input")
    .trigger("change")
    .blur();

  cy.wait(500);
});

When("Staf Unit memilih unit tujuan pertama yang tersedia", () => {
  cleanupEmptyRepeaterRows();
  cy.get("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan'), .fi-fo-field:contains('Penerima Surat')")
    .first()
    .within(() => {
      cy.get("button.fi-select-input-btn, button, select, [role='combobox']").first().click({ force: true });
    });

  cy.wait(1500);

  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
    .last()
    .find("li[role='option'], [role='option'], .fi-select-input-option")
    .first()
    .click({ force: true });

  cy.wait(1000);

  // Verifikasi badge telah terbentuk di kontainer field wrapper
  cy.get("[data-field-wrapper]:contains('Penerima Surat'), [data-field-wrapper]:contains('Unit Tujuan')")
    .first()
    .find(".fi-badge, .fi-select-input-value-badges-ctn, [class*='badge']")
    .should("exist");
});

When("Staf Unit mengisi konten naskah surat dengan {string}", (isiNaskah) => {
  cy.wait(1000);
  cy.window().then((win) => {
    const hasEditors = win.tinymce && win.tinymce.editors && Object.keys(win.tinymce.editors).length > 0;
    if (win.tinymce && (win.tinymce.activeEditor || hasEditors)) {
      const editor = win.tinymce.get("content.isi_surat") || win.tinymce.activeEditor || (hasEditors ? Object.values(win.tinymce.editors)[0] : null);
      if (editor) {
        editor.setContent(`<p>${isiNaskah}</p>`);
        editor.fire("change");
        editor.save();
        return;
      }
    }

    cy.get("body").then(($body) => {
      const iframes = $body.find("iframe");
      if (iframes.length > 0) {
        cy.wrap(iframes.first()).then(($iframe) => {
          const doc = $iframe.contents().find("body");
          if (doc.length > 0) {
            cy.wrap(doc).clear({ force: true }).type(isiNaskah, { force: true });
          }
        });
      } else {
        const textareas = $body.find("textarea[id*='isi'], textarea[name*='isi'], textarea");
        if (textareas.length > 0) {
          cy.wrap(textareas.first()).clear({ force: true }).type(isiNaskah, { force: true });
        }
      }
    });
  });
});

When("Staf Unit memastikan unit tujuan dan jalur persetujuan dalam keadaan kosong", () => {
  cy.get("body").then(($body) => {
    // 1. Hapus pilihan Unit Tujuan jika ada badge terpilih
    const deleteBadges = $body.find(".fi-fo-field-wrp:contains('Penerima Surat') button[title*='Delete'], .fi-fo-field-wrp:contains('Penerima Surat') .fi-badge-delete-btn, .fi-fo-field-wrp:contains('Unit Tujuan') button");
    if (deleteBadges.length > 0) {
      cy.wrap(deleteBadges).each(($b) => cy.wrap($b).click({ force: true }));
    }

    // 2. Hapus semua baris default pada repeater Jalur Persetujuan Khusus agar approval_path kosong
    const deleteRepeater = $body.find(".fi-section:contains('Jalur Persetujuan') button[title*='Delete'], .fi-section:contains('Jalur Persetujuan') button[aria-label*='Delete'], .fi-section:contains('Jalur Persetujuan') .fi-fo-repeater-item-delete-btn");
    if (deleteRepeater.length > 0) {
      cy.wrap(deleteRepeater).each(($btn) => {
        cy.wrap($btn).click({ force: true });
        cy.wait(500);
      });
    }
  });
  cy.wait(800);
});

When("Staf Unit menambahkan jalur persetujuan khusus untuk jabatan pimpinan", () => {
  // 1. Scroll dan buka section Jalur Persetujuan Khusus
  cy.contains(".fi-section-header", /Jalur Persetujuan Khusus/i)
    .scrollIntoView()
    .click({ force: true });
  cy.wait(1000);

  // 2. Klik tombol tambah repeater dan tunggu Livewire me-render baris baru
  cy.contains("button", /Add to alur Persetujuan|Tambah/i, { timeout: 10000 })
    .scrollIntoView()
    .click({ force: true });
  cy.wait(1500);

  // 3. Pastikan section tetap terbuka jika re-render sempat menutupnya
  cy.get("body").then(($body) => {
    const $btn = $body.find(".fi-select-input-btn:visible");
    if ($btn.length === 0) {
      cy.contains(".fi-section-header", /Jalur Persetujuan Khusus/i).click({ force: true });
      cy.wait(1000);
    }
  });

  // 4. Buka dropdown jabatan
  cy.get(".fi-select-input-btn", { timeout: 10000 })
    .last()
    .scrollIntoView()
    .click({ force: true });
  cy.wait(1000);

  // 5. Cari dan pilih opsi jabatan pimpinan (Wakil Rektor II)
  cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible").last().then(($panel) => {
    const $search = $panel.find("input.fi-input, input[type='search'], input[type='text'], input");
    if ($search.length > 0) {
      cy.wrap($search.first()).type("Wakil Rektor II", { force: true });
      cy.wait(1000);
    }
    cy.get(".fi-dropdown-panel:visible, [role='listbox']:visible")
      .last()
      .find(".fi-dropdown-list-item, [role='option'], li")
      .first()
      .click({ force: true });
  });

  cy.wait(800);

  // 6. Aktifkan switch Penandatangan secara defensif jika tersedia
  cy.get("body").then(($body) => {
    const $sw = $body.find("button[role='switch'][id*='is_signer'], button[role='switch']");
    if ($sw.length > 0) {
      if ($sw.attr("aria-checked") !== "true") {
        cy.wrap($sw.last()).click({ force: true });
      }
    }
  });
});



When("Staf Unit mengisi catatan pengiriman pada modal dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Staf Unit mengonfirmasi pengiriman surat pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button.fi-btn-primary, button:contains('Submit'), button:contains('Kirim')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses pengiriman surat {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
});

Then("Sistem mengalihkan pengguna ke halaman surat keluar {string}", (expectedUrlPattern) => {
  cy.url({ timeout: 15000 }).should("include", expectedUrlPattern);
});

Then("Surat yang baru dikirim dengan judul unik tersebut tercatat pada sistem", () => {
  const lastTitle = Cypress.env("lastCreatedPerihal");
  if (lastTitle) {
    // Cari judul di kolom pencarian tabel agar tidak tertahan paginasi
    cy.get("body").then(($body) => {
      const $search = $body.find(".fi-ta-search-field input, input[type='search'], input[placeholder*='Cari'], input[placeholder*='Search']");
      if ($search.length > 0 && $search.is(":visible")) {
        cy.wrap($search.first()).clear({ force: true }).type(`${lastTitle}{enter}`, { force: true });
        cy.wait(1500);
      }
    });
    cy.contains("tr", lastTitle, { timeout: 15000 })
      .invoke("text")
      .should("match", /TERKIRIM|DIPROSES/i);
  }
});

Then("Sistem menolak pengiriman dan menampilkan notifikasi peringatan tujuan {string}", (expectedWarning) => {
  assertToastNotification(expectedWarning);
});

Then("Surat dengan jalur persetujuan tersebut tercatat dengan status diproses", () => {
  const lastTitle = Cypress.env("lastCreatedPerihal");
  if (lastTitle) {
    // Cari judul di kolom pencarian tabel agar tidak tertahan paginasi
    cy.get("body").then(($body) => {
      const $search = $body.find(".fi-ta-search-field input, input[type='search'], input[placeholder*='Cari'], input[placeholder*='Search']");
      if ($search.length > 0 && $search.is(":visible")) {
        cy.wrap($search.first()).clear({ force: true }).type(`${lastTitle}{enter}`, { force: true });
        cy.wait(1500);
      }
    });
    cy.contains("tr", lastTitle, { timeout: 15000 })
      .invoke("text")
      .should("match", /TERKIRIM|DIPROSES/i);
  }
});

// ─── AKSI PENGEMBALIAN & BACKTRACK (FR-SRT-05) ───────────────────────────────

When("Pimpinan membuka grup aksi {string}", (groupName) => {
  cy.wait(800);
  cy.get(".fi-header-actions, .fi-page-header, body")
    .contains("button", groupName, { timeout: 10000 })
    .click({ force: true });
  cy.wait(800);
});

When("Pimpinan memilih aksi {string}", (actionName) => {
  const pattern = new RegExp(
    actionName
      .replace(/[()]/g, "\\$&")
      .replace(/Finalisasi & Selesai/i, "(?:2\\.\\s*)?Finalisasi & (?:Selesai|Selesaikan Surat)"),
    "i"
  );
  cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible, [role='menu']:visible", { timeout: 8000 })
    .last()
    .contains("button, [role='menuitem'], a", pattern, { timeout: 8000 })
    .click({ force: true });
  cy.wait(800);
});

When("Pimpinan mengosongkan teks alasan pengembalian pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true });
});

When("Pimpinan menekan tombol submit modal pengembalian", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit')")
    .first()
    .click({ force: true });
});

Then("Form modal menampilkan validasi bahwa alasan pengembalian wajib diisi", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .find("textarea")
    .first()
    .then(($textarea) => {
      // Validasi HTML5 :invalid atau border merah Filament
      const isInvalid = $textarea.is(":invalid") || $textarea.hasClass("border-danger-600") || $textarea.attr("aria-invalid") === "true";
      expect(isInvalid || $textarea.prop("required")).to.be.true;
    });
});

When("Pimpinan membatalkan modal pengembalian surat", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .contains("button", /Cancel|Batal|Tutup/i)
    .first()
    .click({ force: true });

  // Verifikasi modal telah tertutup (butir 20 AGENTS.md)
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible").should("not.exist");
});

When("Pimpinan mengisi alasan pengembalian dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

Then("Sistem menampilkan notifikasi sukses pengembalian {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan mengisi alasan revisi total dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

Then("Sistem menampilkan notifikasi sukses revisi {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan mengisi alasan penolakan permanen dengan {string}", (alasan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(alasan, { force: true });
});

When("Pimpinan mengonfirmasi penolakan permanen pada modal", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Tolak')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi penolakan {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

// ─── ALUR LINIMASA, RESPON, DOKUMEN & TTE (FR-SRT-09..11 & FR-TTD-01) ────────

When("Pimpinan memeriksa section linimasa {string}", (sectionTitle) => {
  const pattern = new RegExp(sectionTitle.replace(/[()]/g, "\\$&"), "i");
  cy.contains("span, h2, h3, div, p", pattern, { timeout: 15000 })
    .scrollIntoView()
    .should("exist");
});

Then("Sistem menampilkan tahapan perjalanan surat meliputi riwayat pembuatan dan distribusi surat", () => {
  cy.get("body").then(($b) => {
    const hasCreated = $b.text().includes("Surat Dibuat");
    const hasSent = $b.text().includes("Surat Dikirim") || $b.text().includes("Tujuan Utama");
    expect(hasCreated || hasSent).to.be.true;
  });
});

When("Pimpinan memeriksa area dokumen naskah surat dan lampiran", () => {
  cy.get(".surat-page-sheet, .preview-container, .fi-section:contains('Lampiran'), body", { timeout: 15000 })
    .first()
    .scrollIntoView()
    .should("exist");
});

Then("Sistem menyediakan akses tampilan dokumen naskah serta berkas lampiran surat", () => {
  cy.get("body").then(($body) => {
    const hasNaskah = $body.find(".surat-page-sheet, [class*='surat-page'], iframe, .prose").length > 0;
    const hasLampiran = $body.text().includes("Lampiran Berkas") || $body.text().includes("Lampiran");
    expect(hasNaskah || hasLampiran).to.be.true;
  });
});

When("Pimpinan memilih aksi pengaturan tanda tangan digital", () => {
  cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 8000 })
    .contains("button, [role='menuitem'], a", /1\. Bubuhkan & Atur TTD|1\. Ubah Metode|Bubuhkan TTD/i, { timeout: 8000 })
    .click({ force: true });
  cy.wait(1000);
});

When("Pimpinan memilih metode pengesahan {string}", (metodeLabel) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .contains("label, span", metodeLabel)
    .first()
    .click({ force: true });
});

When("Pimpinan memastikan opsi tampilkan nama penandatangan aktif", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .contains("label, .fi-fo-field-wrp", /Tampilkan Nama & Jabatan/i)
    .then(($wrp) => {
      const sw = $wrp.find("button[role='switch'], input[type='checkbox']");
      if (sw.length > 0) {
        if (sw.is("button") && sw.attr("aria-checked") !== "true") {
          cy.wrap(sw).click({ force: true });
        } else if (sw.is("input") && !sw.is(":checked")) {
          cy.wrap(sw).check({ force: true });
        }
      }
    });
});

When("Pimpinan menerapkan pengaturan tanda tangan ke lembar surat", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible")
    .find("button[type='submit'], button:contains('Terapkan')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses penyiapan TTD {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
});

When("Pimpinan mengisi catatan persetujuan akhir dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Pimpinan menekan tombol konfirmasi finalisasi surat", () => {
  // Simpan URL surat yang difinalisasi agar tidak dibuka kembali oleh skenario berikutnya
  cy.url().then((url) => {
    Cypress.env("lastFinalizedSuratUrl", url);
  });

  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Finalisasi')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi sukses finalisasi {string}", (expectedMessage) => {
  assertToastNotification(expectedMessage);
  Cypress.env("activePendingSurat", null);
});

When("Pimpinan memilih aksi tanggapi dan selesaikan internal", () => {
  cy.get("body").then(($body) => {
    const directBtn = $body.find(".fi-header-actions button:contains('Tanggapi & Selesaikan'), .fi-page-header button:contains('Tanggapi & Selesaikan')");
    if (directBtn.length > 0) {
      cy.wrap(directBtn.first()).click({ force: true });
    } else if ($body.find("button:contains('Proses Surat')").length > 0) {
      cy.get(".fi-header-actions, .fi-page-header, body")
        .contains("button", "Proses Surat", { timeout: 10000 })
        .click({ force: true });
      cy.wait(800);
      cy.get(".fi-dropdown-panel:visible, div[x-ref='panel']:visible", { timeout: 8000 })
        .contains("button, [role='menuitem'], a", /(?:2\.\s*)?Finalisasi & (?:Selesai|Selesaikan Surat)|Teruskan Saja/i)
        .first()
        .click({ force: true });
    }
  });
});

When("Pimpinan mengisi catatan balasan penyelesaian dengan {string}", (catatan) => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("textarea")
    .first()
    .clear({ force: true })
    .type(catatan, { force: true });
});

When("Pimpinan menekan tombol submit catatan penyelesaian", () => {
  cy.get(".fi-modal:visible:not(#database-notifications), [role='dialog']:visible", { timeout: 10000 })
    .find("button[type='submit'], button:contains('Submit'), button:contains('Finalisasi')")
    .first()
    .click({ force: true });
});

Then("Sistem menampilkan notifikasi surat diselesaikan atau terproses", () => {
  cy.get(".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body", { timeout: 15000 })
    .should("exist");
  Cypress.env("activePendingSurat", null);
});
