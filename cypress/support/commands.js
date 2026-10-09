Cypress.Commands.add('loginAs', (role) => {
  cy.visit('/internal/login');
  
  let username = '';
  let password = 'password';

  switch (role.toLowerCase()) {
    case 'admin':
      username = 'admin';
      password = 'password';
      break;
    case 'pegawai':
    case 'staff':
      username = 'stafflogistik';
      password = 'password123';
      break;
    case 'mahasiswa':
      username = 'mahasiswa';
      password = 'password123';
      break;
    default:
      throw new Error(`Role "${role}" is not recognized for loginAs custom command.`);
  }

  cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]')
    .first()
    .clear()
    .type(username);

  cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
    .first()
    .clear()
    .type(password);

  cy.contains('button', 'Sign in').click();
  
  // Assert successful login
  cy.url().should('include', '/internal');
});