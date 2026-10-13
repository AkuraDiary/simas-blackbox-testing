Cypress.Commands.add('loginAs', (role) => {
  cy.visit('/internal/login');

  cy.url().then((currentUrl) => {
    // Jika sudah terotentikasi dan langsung diredirect dari /login
    if (!currentUrl.includes('/login')) {
      return;
    }

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
      case 'pakrektor':
      case 'rektor':
        username = 'pakrektor';
        password = 'password';
        break;
      default:
        username = role;
        password = 'password';
        break;
    }

    cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]')
      .first()
      .clear()
      .type(username);

    cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
      .first()
      .clear()
      .type(`${password}{enter}`);

    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.url().should('include', '/internal');
  });
});