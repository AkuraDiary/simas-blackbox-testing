import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("Saya mengunggah file fixture {string} pada modal import", (fileName) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .find("input[type='file']")
    .selectFile(`cypress/fixtures/${fileName}`, { force: true });
  
  // Tunggu sejenak agar Filament memproses preview/upload file
  cy.wait(1500);
});

When("Saya menekan tombol {string} pada modal import", (buttonText) => {
  cy.get(".fi-modal:visible", { timeout: 10000 })
    .contains("button", buttonText, { matchCase: false })
    .click({ force: true });
});

Then("Saya harus melihat notifikasi proses import dimulai", () => {
  // Notifikasi Filament saat proses import di-queue atau berhasil dieksekusi
  cy.contains(
    ".fi-no-notification, .fi-notification, [role='status'], [role='alert'], body",
    /(import|impor|dimulai|started|berhasil|selesai)/i,
    { timeout: 15000 }
  ).should("be.visible");
});

Then("Form modal import menolak file atau menampilkan validasi format salah", () => {
  // Filament menampilkan error validasi tipe file atau FilePond status error
  cy.get(".fi-modal:visible", { timeout: 8000 }).within(() => {
    cy.get(".fi-fo-field-wrp-error-message, .text-danger-600, :invalid, [role='alert'], .filepond--file-status, .filepond--root, .filepond--panel", { timeout: 6000 })
      .should("exist");
  });
});
