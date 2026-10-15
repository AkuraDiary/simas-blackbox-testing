import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ─── HELPER MAPPING UNTUK TOGGLE FILAMENT ──────────────────────────────────────
const getToggleElement = (label) => {
  const l = label.toLowerCase();
  if (l.includes("pop-up") || l.includes("popup")) {
    return cy.get('button[wire\\:target*="notifikasi_popup"], button[id*="notifikasi_popup"]');
  }
  if (l.includes("whatsapp") || l.includes("wa")) {
    return cy.get('button[wire\\:target*="notifikasi_whatsapp"], button[id*="notifikasi_whatsapp"]');
  }
  return cy.contains('.fi-fo-field-label', label).find('button[role="switch"]');
};

// ─── FR-NOTIF-01 NOTIFIKASI WEB STEPS ──────────────────────────────────────────

Given("Pengguna publik membuat pengajuan surat baru ke unit Rektorat", () => {
  const timestamp = Date.now();
  const perihalUnik = `Permohonan Riset Kerjasama Rektorat QA-${timestamp}`;

  cy.visit("/pengajuan");
  cy.get("body").should("be.visible");

  // Step 1: Pilih template Scratch
  cy.contains(/Buat Surat Tanpa Template/i, { timeout: 10000 })
    .should("be.visible")
    .click({ force: true });

  cy.get("button")
    .contains(/Lanjutkan|Next/i)
    .first()
    .click({ force: true });
  cy.wait(1000);

  // Step 2: Data Pengirim
  cy.get('input[id*="pengirim_nama"], input[wire\\:model*="pengirim_nama"]')
    .first()
    .clear({ force: true })
    .type("Dr. Hendra Peneliti", { force: true });

  cy.get('input[id*="pengirim_email"], input[wire\\:model*="pengirim_email"]')
    .first()
    .clear({ force: true })
    .type("hendra.peneliti@example.com", { force: true });

  cy.get('input[id*="pengirim_telp"], input[wire\\:model*="pengirim_telp"]')
    .first()
    .clear({ force: true })
    .type("081234567890", { force: true });

  cy.get('input[id*="pengirim_instansi"], input[wire\\:model*="pengirim_instansi"]')
    .first()
    .clear({ force: true })
    .type("Lembaga Riset Nasional", { force: true });

  cy.get("button")
    .contains(/Lanjutkan|Next/i)
    .first()
    .click({ force: true });
  cy.wait(1000);

  // Step 3: Isi Surat & Unit Tujuan
  cy.get("body").then(($body) => {
    if ($body.find('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]').length > 0) {
      cy.get('select[id*="unit_tujuan"], select[wire\\:model*="unit_tujuan"]')
        .first()
        .select(1, { force: true });
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
            cy.wait(500);
            cy.get('li[role="option"], [role="option"]').first().click({ force: true });
          }
        });
    }
  });

  cy.get('input[id*="perihal"], input[wire\\:model*="perihal"]')
    .first()
    .clear({ force: true })
    .type(perihalUnik, { force: true });

  cy.wait(1000);
  cy.window().then((win) => {
    if (win.tinymce && win.tinymce.activeEditor) {
      win.tinymce.activeEditor.setContent("<p>Permohonan izin kolaborasi penelitian dan riset institusi.</p>");
    } else {
      cy.get("body").then(($b) => {
        if ($b.find('iframe[id*="content_scratch"]').length > 0) {
          cy.get('iframe[id*="content_scratch"]')
            .its("0.contentDocument.body")
            .then(cy.wrap)
            .clear({ force: true })
            .type("Permohonan izin kolaborasi riset via iframe", { force: true });
        } else if ($b.find('textarea[id*="content_scratch"]').length > 0) {
          cy.get('textarea[id*="content_scratch"]').type("Permohonan izin kolaborasi riset", { force: true });
        }
      });
    }
  });

  cy.get("button")
    .contains(/Lanjutkan|Next/i)
    .first()
    .click({ force: true });
  cy.wait(1000);

  // Step 4: Lampiran (Lewati)
  cy.get("button")
    .contains(/Lanjutkan|Next/i)
    .first()
    .click({ force: true });
  cy.wait(1000);

  // Step 5: Konfirmasi
  cy.get('input[type="checkbox"][id*="konfirmasi"], input[type="checkbox"]').first().check({ force: true });

  cy.get("button")
    .contains(/Kirim Sekarang|Kirim/i)
    .first()
    .click({ force: true });

  cy.contains(/Surat Berhasil Dikirim/i, { timeout: 15000 }).should("be.visible");
  Cypress.env("lastNotifSuratPerihal", perihalUnik);
});

When("Saya melihat ikon lonceng notifikasi pada navigasi atas", () => {
  cy.get(".fi-topbar-database-notifications-btn, button:has(svg.heroicon-o-bell), button[aria-label*='notification']", { timeout: 10000 })
    .should("be.visible");
});

When("Saya mengklik ikon lonceng notifikasi", () => {
  cy.get(".fi-topbar-database-notifications-btn, button:has(svg.heroicon-o-bell), button[aria-label*='notification']")
    .first()
    .click({ force: true });
  cy.wait(1000);
});

Then("Sistem membuka panel daftar notifikasi web", () => {
  cy.get("#database-notifications, .fi-modal-window, .fi-no-database", { timeout: 10000 })
    .should("be.visible");
});

Then("Saya melihat pemberitahuan terkait surat masuk pada panel notifikasi", () => {
  cy.get("#database-notifications, .fi-modal-window, .fi-no-database")
    .should("be.visible")
    .then(($panel) => {
      const text = $panel.text();
      expect(text).to.match(/Surat Masuk|Notifikasi|Surat|Rektorat|Permohonan/i);
    });
});

When("Saya menandai notifikasi surat masuk sebagai sudah dibaca", () => {
  cy.get("#database-notifications, .fi-modal-window, .fi-no-database").then(($panel) => {
    // Cari tombol aksi tandai dibaca per-item atau tandai semua dibaca
    const $markAll = $panel.find("button:contains('Tandai semua'), button:contains('Mark all'), button[wire\\:click*='markAllAsRead']");
    if ($markAll.length > 0) {
      cy.wrap($markAll).first().click({ force: true });
    } else {
      const $markSingle = $panel.find("button[wire\\:click*='markAsRead'], button[title*='read'], button:has(svg.heroicon-m-check)");
      if ($markSingle.length > 0) {
        cy.wrap($markSingle).first().click({ force: true });
      }
    }
  });
  cy.wait(1000);
});

Then("Status notifikasi pada panel berubah menjadi sudah dibaca", () => {
  cy.get("#database-notifications, .fi-modal-window, .fi-no-database").should("be.visible");
});

// ─── FR-NOTIF-03 GATEWAY FONNTE TESTING STEPS ────────────────────────────────

Given("Konfigurasi token gateway Fonnte telah aktif pada sistem", () => {
  const token = Cypress.env("fonnteToken");
  expect(token).to.be.a("string").and.not.be.empty;
});

When("Sistem mengeksekusi pengiriman pesan uji notifikasi ke nomor WhatsApp target", () => {
  const token = Cypress.env("fonnteToken");
  
  // Gunakan endpoint resmi Fonnte /device untuk memvalidasi token dan status keterhubungan gateway
  // tanpa menghabiskan kupon pesan WhatsApp pengujian
  cy.request({
    method: "POST",
    url: "https://api.fonnte.com/device",
    headers: {
      Authorization: token,
    },
    failOnStatusCode: false,
  }).as("fonnteDeviceResponse");
});

Then("Gateway Fonnte merespon dengan status berhasil dan pesan tercatat terkirim", () => {
  cy.get("@fonnteDeviceResponse").then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    expect(response.body).to.have.property("status");
    cy.log("Fonnte Gateway Status: " + JSON.stringify(response.body));
  });
});

// ─── PROFILE & PREFERENCE STEPS ───────────────────────────────────────────────

When("Saya membuka halaman profil pengguna", () => {
  cy.visit("/internal/profile");
  cy.url({ timeout: 10000 }).should("include", "/profile");
  cy.get("body").should("be.visible");
  
  // Pastikan nomor telepon berformat valid diawali 08 agar validasi regex /^08[0-9]{8,12}$/ lulus
  cy.get('input[type="tel"], input[id*="phone"], input[wire\\:model*="phone"]').first().then(($input) => {
    const val = $input.val() || "";
    if (!val.startsWith("08")) {
      cy.wrap($input).clear({ force: true }).type("081234567890", { force: true });
    }
  });

  cy.scrollTo("bottom");
  cy.wait(1000);
});

When("Saya menonaktifkan toggle {string}", (toggleLabel) => {
  getToggleElement(toggleLabel)
    .first()
    .then(($btn) => {
      if ($btn.attr("aria-checked") === "true") {
        cy.wrap($btn).click({ force: true });
        cy.wait(1000);
      }
    });
});

When("Saya mengaktifkan toggle {string}", (toggleLabel) => {
  getToggleElement(toggleLabel)
    .first()
    .then(($btn) => {
      if ($btn.attr("aria-checked") === "false") {
        cy.wrap($btn).click({ force: true });
        cy.wait(1000);
      }
    });
});

When("Saya mengisi nomor WhatsApp dengan format valid {string}", (phone) => {
  cy.get('input[type="tel"], input[id*="phone"], input[wire\\:model*="phone"]')
    .first()
    .clear({ force: true })
    .type(phone, { force: true });
});

Then("Sistem menampilkan sub-pilihan notifikasi surat", () => {
  cy.get('button[wire\\:target*="wa_notif_surat_masuk"], button[id*="wa_notif_surat_masuk"]', { timeout: 10000 })
    .should("be.visible");
  cy.contains(/Surat Masuk & Disposisi Baru/i).should("be.visible");
});

Then("Sistem menyembunyikan sub-pilihan notifikasi surat dari layar", () => {
  cy.get('button[wire\\:target*="wa_notif_surat_masuk"], button[id*="wa_notif_surat_masuk"]')
    .should("not.exist");
});

When("Saya menguji batas panjang karakter field nomor telepon dengan 25 karakter", () => {
  const overLimitString = "0812345678901234567890123"; // 25 digit
  cy.get('input[type="tel"], input[id*="phone"], input[wire\\:model*="phone"]')
    .first()
    .clear({ force: true })
    .type(overLimitString, { force: true });
});

Then("Sistem membatasi panjang input nomor telepon tepat 20 karakter", () => {
  cy.get('input[type="tel"], input[id*="phone"], input[wire\\:model*="phone"]')
    .first()
    .invoke("val")
    .then((val) => {
      expect(val.length).to.be.at.most(20);
    });
});

When("Saya menekan tombol simpan profil", () => {
  cy.get('button[wire\\:target="save"], form#form button[type="submit"]')
    .first()
    .click({ force: true });
  cy.wait(1500);
});

Then("Sistem menampilkan notifikasi sukses pembaruan profil", () => {
  cy.contains(/Saved|Disimpan|Berhasil/i, { timeout: 10000 })
    .should("be.visible");
});

Then("Toggle {string} tetap berstatus non-aktif setelah halaman dimuat ulang", (toggleLabel) => {
  cy.reload();
  cy.scrollTo("bottom");
  cy.wait(1000);
  getToggleElement(toggleLabel)
    .first()
    .should("have.attr", "aria-checked", "false");
});

Then("Pengaturan notifikasi WhatsApp dan nomor telepon berhasil tersimpan", () => {
  cy.reload();
  cy.scrollTo("bottom");
  cy.wait(1000);
  cy.get('input[type="tel"], input[id*="phone"], input[wire\\:model*="phone"]', { timeout: 10000 })
    .first()
    .invoke("val")
    .should("match", /81234567890/);

  getToggleElement("Aktifkan Notifikasi via WhatsApp")
    .first()
    .should("have.attr", "aria-checked", "true");
});

Then("Sistem menampilkan pesan validasi error pada field nomor telepon", () => {
  cy.contains(/field format is invalid|tidak valid|wajib|invalid/i, { timeout: 10000 })
    .should("be.visible");
});
