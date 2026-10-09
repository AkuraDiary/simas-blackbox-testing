import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Reusable Filament Step Definitions
 * Handles sidebar navigation, modals, notifications, and form fields.
 */

Given("Saya mengakses menu navigasi {string}", (menuLabel) => {
  // Tunggu UI siap dan cari link menu navigasi di sidebar
  cy.get("aside.fi-sidebar, nav.fi-sidebar", { timeout: 10000 })
    .should("be.visible")
    .within(() => {
      cy.contains("a, button", menuLabel, { matchCase: false }).click();
    });
});

When("Saya menekan tombol {string} pada modal", (buttonText) => {
  cy.get(".fi-modal:visible", { timeout: 8000 })
    .contains("button", buttonText, { matchCase: false })
    .click();
});

Then("Saya harus melihat notifikasi {string}", (notificationText) => {
  let regexPattern = new RegExp(notificationText, "i");
  if (/dibuat/i.test(notificationText)) regexPattern = /(dibuat|created)/i;
  else if (/disimpan/i.test(notificationText)) regexPattern = /(disimpan|saved)/i;
  else if (/dihapus/i.test(notificationText)) regexPattern = /(dihapus|deleted)/i;
  else if (/berhasil/i.test(notificationText)) regexPattern = /(berhasil|success)/i;

  cy.contains(
    ".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body",
    regexPattern,
    { timeout: 10000 }
  ).should("be.visible");
});

Then("Saya melihat notifikasi error {string}", (errorMessage) => {
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='alert'], body",
    errorMessage,
    { timeout: 10000 }
  ).should("be.visible");
});

Then("Saya melihat pesan validasi {string}", (validationMessage) => {
  cy.contains(
    ".fi-fo-field-wrp-error-message, .text-danger-600, .fi-error, [role='alert'], body",
    validationMessage,
    { timeout: 8000 }
  ).should("be.visible");
});

When("Saya menutup modal aktif", () => {
  cy.get(".fi-modal:visible")
    .find("button[aria-label='Close'], button:contains('Cancel'), button:contains('Batal'), button:contains('Tutup'), .fi-modal-close-btn")
    .first()
    .click({ force: true });
});
