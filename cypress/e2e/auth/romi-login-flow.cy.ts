/// <reference types="cypress" />

describe('Complete User Flow - Romi Login', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  it('should login as "romi" and display all 3 sector options on HomePage', () => {
    // 1. Visit login page
    cy.visit('/login');

    // 2. Mock successful login response for user "romi" with sector "admin"
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mock-access-token-romi',
        refreshToken: 'mock-refresh-token-romi',
        user: {
          id: 1,
          username: 'romi',
          nombre: 'Romi',
          apellido: 'Test',
          sector: 'admin', // admin sector has access to all 3 modules
          activo: true,
        },
      },
    }).as('loginRequest');

    // 3. Fill in the login form
    cy.get('input[type="text"]').should('be.visible').type('romi');
    cy.get('input[type="password"]').should('be.visible').type('1234');

    // 4. Submit the form
    cy.get('button[type="submit"]').click();

    // 5. Wait for the API call
    cy.wait('@loginRequest');

    // 6. Assert redirect to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // 7. Verify user welcome message
    cy.contains('Bienvenido, Romi Test').should('be.visible');
    cy.contains('Sector:').should('be.visible');
    cy.contains('admin').should('be.visible');

    // 8. Verify all 3 sector cards are displayed
    // Card 1: Pedidos
    cy.contains('h3', 'Pedidos').should('be.visible');
    cy.contains('Gestión de pedidos de clientes').should('be.visible');

    // Card 2: Armado de Pedidos
    cy.contains('h3', 'Armado de Pedidos').should('be.visible');
    cy.contains('Preparación y armado de pedidos').should('be.visible');

    // Card 3: Facturación
    cy.contains('h3', 'Facturación').should('be.visible');
    cy.contains('Gestión de facturas y pagos').should('be.visible');

    // 9. Verify exactly 3 cards are displayed
    cy.get('.grid').find('.cursor-pointer').should('have.length', 3);

    // 10. Verify localStorage contains auth data
    cy.window().then((window) => {
      const authStorage = window.localStorage.getItem('auth-storage');
      expect(authStorage).to.exist;
      
      const parsedAuth = JSON.parse(authStorage!);
      expect(parsedAuth.state.user.username).to.equal('romi');
      expect(parsedAuth.state.user.sector).to.equal('admin');
      expect(parsedAuth.state.isAuthenticated).to.be.true;
    });
  });

  it('should navigate to each sector page when clicking cards', () => {
    // Login first
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: {
          id: 1,
          username: 'romi',
          nombre: 'Romi',
          apellido: 'Test',
          sector: 'admin',
          activo: true,
        },
      },
    }).as('loginRequest');

    cy.get('input[type="text"]').type('romi');
    cy.get('input[type="password"]').type('1234');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    // Test navigation to Pedidos
    cy.contains('h3', 'Pedidos').click();
    cy.url().should('include', '/orders');
    cy.go('back');

    // Test navigation to Armado de Pedidos
    cy.contains('h3', 'Armado de Pedidos').click();
    cy.url().should('include', '/assembly');
    cy.go('back');

    // Test navigation to Facturación
    cy.contains('h3', 'Facturación').click();
    cy.url().should('include', '/billing');
  });

  it('should display logout button on HomePage', () => {
    // Login first
    cy.visit('/login');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: {
          id: 1,
          username: 'romi',
          nombre: 'Romi',
          apellido: 'Test',
          sector: 'admin',
          activo: true,
        },
      },
    }).as('loginRequest');

    cy.get('input[type="text"]').type('romi');
    cy.get('input[type="password"]').type('1234');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');

    // Verify logout button is visible
    cy.contains('Cerrar Sesión').should('be.visible');
    
    // Click logout and verify redirect to login
    cy.contains('Cerrar Sesión').click();
    cy.url().should('include', '/login');

    // Verify localStorage is cleared
    cy.window().then((window) => {
      const authStorage = window.localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        expect(parsedAuth.state.isAuthenticated).to.be.false;
      }
    });
  });
});
