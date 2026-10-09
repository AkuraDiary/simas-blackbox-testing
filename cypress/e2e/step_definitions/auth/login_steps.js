import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("Saya berada di halaman login", () => {
  cy.visit("/internal/login");
});

Given("Saya login ke sistem sebagai {string}", (role) => {
  cy.loginAs(role);
});

When("Saya memasukkan email {string} dan password {string}", (email, password) => {
  cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"], input[type="email"]')
    .first()
    .clear()
    .type(email);
  cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
    .first()
    .clear()
    .type(password);
});

When("Saya memasukkan username {string} dan password {string}", (username, password) => {
  cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]')
    .first()
    .clear()
    .type(username);
  cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
    .first()
    .clear()
    .type(password);
});

When("Saya menekan tombol {string}", (buttonText) => {
  cy.contains('button', buttonText).click();
});

Then("Saya harus diarahkan ke halaman dashboard", () => {
  cy.url().should('include', '/internal');
});

Then("Saya melihat teks {string}", (text) => {
  cy.contains(text).should('be.visible');
});

Then("Saya harus melihat pesan error {string}", (errorMessage) => {
  cy.contains(errorMessage).should('be.visible');
});

When("Saya membuka menu profil user", () => {
  cy.wait(500); 
  cy.get('button[title="User menu"], [aria-label="User menu"], .fi-user-menu button').first().click(); 
});

Then("Saya harus diarahkan kembali ke halaman login", () => {
  cy.url().should('include', '/internal/login');
});
