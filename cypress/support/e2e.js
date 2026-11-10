import './commands';

// Mencegah Cypress gagal otomatis karena unhandled promise rejection dari FilePond/Livewire saat file ditolak
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

// Pastikan tema selalu Light Mode secara konsisten di setiap siklus navigasi
beforeEach(() => {
  cy.on('window:before:load', (win) => {
    win.localStorage.setItem('theme', 'light');
    win.localStorage.setItem('color-theme', 'light');
  });
});
