Cypress.Commands.add('loginAs', (role) => {
  cy.visit('/internal/login');

  cy.url().then((currentUrl) => {
    // Jika sudah terotentikasi dan langsung diredirect dari /login
    if (!currentUrl.includes('/login')) {
      return;
    }

    let username = '';
    let password = 'password123';

    switch (role.toLowerCase()) {
      case 'admin':
        username = 'admin';
        password = 'password';
        break;
      case 'staff.fik':
      case 'pegawai':
      case 'staff':
      case 'arasy':
      case 'budisantoso': // Fallback backward-compatibility
        username = 'staff.fik';
        password = 'password123';
        break;
      case 'dekan.fik':
        username = 'dekan.fik';
        password = 'password123';
        break;
      case 'rektor':
      case 'pakrektor': // Fallback backward-compatibility
        username = 'rektor';
        password = 'password123';
        break;
      case 'warek2':
        username = 'warek2';
        password = 'password123';
        break;
      case 'staff.baku':
      case 'stafflogistik': // Fallback backward-compatibility
        username = 'staff.baku';
        password = 'password123';
        break;
      case 'kepala.baku':
        username = 'kepala.baku';
        password = 'password123';
        break;
      case 'mahasiswa':
        username = 'mahasiswa';
        password = 'password';
        break;
      default:
        username = role;
        password = 'password123';
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