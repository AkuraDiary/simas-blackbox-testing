import './commands';

// Mencegah Cypress gagal otomatis karena unhandled promise rejection dari FilePond/Livewire saat file ditolak
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});