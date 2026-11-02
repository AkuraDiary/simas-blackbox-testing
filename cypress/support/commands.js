Cypress.Commands.add('loginAs', (role) => {
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
    case 'budisantoso': // Fallback persona staf penerima disposisi (Staf FIK)
      username = 'staff.fik';
      password = 'password123';
      break;
    case 'dekan.fik':
      username = 'dekan.fik';
      password = 'password123';
      break;
    case 'rektor':
    case 'pakrektor': // Fallback persona pimpinan (Dekan FIK / Rektorat)
      username = 'dekan.fik';
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
      password = 'password123';
      break;
    default:
      username = role;
      password = 'password123';
      break;
  }

  cy.session(
    `user-${username}`,
    () => {
      cy.visit('/internal/login');
      cy.get('input[id*="username"], input[wire\\:model*="username"], input[type="text"]', { timeout: 15000 })
        .first()
        .clear({ force: true })
        .type(username, { force: true });

      cy.get('input[id*="password"], input[wire\\:model*="password"], input[type="password"]')
        .first()
        .clear({ force: true })
        .type(password, { force: true });

      cy.get(".fi-form-actions button[type='submit'], form button[type='submit']")
        .first()
        .click({ force: true });

      cy.url({ timeout: 15000 }).should('not.include', '/login');
      cy.url().should('include', '/internal');
    },
    {
      validate() {
        cy.request({
          url: '/internal',
          followRedirect: false,
          failOnStatusCode: false,
        }).then((response) => {
          if (response.status === 302) {
            expect(response.headers.location).to.not.include('/login');
          } else {
            expect(response.status).to.eq(200);
          }
        });
      },
    }
  );

  cy.visit('/internal');
  cy.url({ timeout: 15000 }).should('not.include', '/login');
});
