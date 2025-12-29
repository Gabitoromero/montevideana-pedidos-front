/// <reference types="cypress" />

describe('HomePage Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Admin User HomePage', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'admin-token',
          refreshToken: 'admin-refresh',
          user: {
            id: 1,
            username: 'admin',
            nombre: 'Gabriel',
            apellido: 'Romero',
            sector: 'admin',
            activo: true,
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');
    });

    it('should display logo and welcome message', () => {
      // Verify logo
      cy.get('img[alt="La Montevideana System"]').should('be.visible');

      // Verify welcome message with user name
      cy.contains('Bienvenido, Gabriel Romero').should('be.visible');

      // Verify instruction text
      cy.contains('Selecciona un módulo para comenzar').should('be.visible');
    });

    it('should display user sector correctly', () => {
      cy.contains('Sector:').should('be.visible');
      cy.contains('admin').should('be.visible');
    });

    it('should display all sector cards for admin', () => {
      // Verify all 3 cards are present
      cy.contains('h3', 'Pedidos').should('be.visible');
      cy.contains('Gestión de pedidos de clientes').should('be.visible');

      cy.contains('h3', 'Armado de Pedidos').should('be.visible');
      cy.contains('Preparación y armado de pedidos').should('be.visible');

      cy.contains('h3', 'Facturación').should('be.visible');
      cy.contains('Gestión de facturas y pagos').should('be.visible');

      // Verify exactly 3 cards
      cy.get('.grid').find('.cursor-pointer').should('have.length', 3);
    });

    it('should navigate to Orders page when clicking Pedidos card', () => {
      cy.contains('h3', 'Pedidos').click();
      cy.url().should('include', '/orders');
    });

    it('should navigate to Assembly page when clicking Armado card', () => {
      cy.contains('h3', 'Armado de Pedidos').click();
      cy.url().should('include', '/assembly');
    });

    it('should navigate to Billing page when clicking Facturación card', () => {
      cy.contains('h3', 'Facturación').click();
      cy.url().should('include', '/billing');
    });

    it('should display logout button', () => {
      cy.contains('Cerrar Sesión').should('be.visible');
    });

    it('should have hover effects on cards', () => {
      // Get first card and trigger hover
      cy.contains('h3', 'Pedidos')
        .parent()
        .parent()
        .parent()
        .should('have.class', 'cursor-pointer')
        .should('have.class', 'hover:scale-105');
    });
  });

  describe('CHESS User HomePage', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'chess-token',
          refreshToken: 'chess-refresh',
          user: {
            id: 2,
            username: 'romi',
            nombre: 'Romi',
            apellido: 'Test',
            sector: 'CHESS',
            activo: true,
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('romi');
      cy.get('input[type="password"]').type('1234');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');
    });

    it('should display CHESS sector', () => {
      cy.contains('Sector:').should('be.visible');
      cy.contains('CHESS').should('be.visible');
    });

    it('should display 3 cards for CHESS user', () => {
      cy.contains('h3', 'Pedidos').should('be.visible');
      cy.contains('h3', 'Armado de Pedidos').should('be.visible');
      cy.contains('h3', 'Facturación').should('be.visible');

      cy.get('.grid').find('.cursor-pointer').should('have.length', 3);
    });

    it('should navigate correctly from all cards', () => {
      // Test Pedidos
      cy.contains('h3', 'Pedidos').click();
      cy.url().should('include', '/orders');
      cy.go('back');

      // Test Armado
      cy.contains('h3', 'Armado de Pedidos').click();
      cy.url().should('include', '/assembly');
      cy.go('back');

      // Test Facturación
      cy.contains('h3', 'Facturación').click();
      cy.url().should('include', '/billing');
    });
  });

  describe('Sector-based Redirection', () => {
    it('should redirect admin to homepage after login', () => {
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 1, username: 'admin', nombre: 'Admin', sector: 'admin', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect CHESS to homepage after login', () => {
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 2, username: 'chess', nombre: 'Chess', sector: 'CHESS', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('chess');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect armado to /assembly after login', () => {
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 3, username: 'armado', nombre: 'Armado', sector: 'armado', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('armado');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      cy.url().should('include', '/assembly');
    });

    it('should redirect facturacion to /billing after login', () => {
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 4, username: 'billing', nombre: 'Billing', sector: 'facturacion', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('billing');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      cy.url().should('include', '/billing');
    });
  });

  describe('Empty State', () => {
    it('should show message when user has no accessible modules', () => {
      // This is an edge case - create a user with no permissions
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { 
            id: 5, 
            username: 'noperm', 
            nombre: 'No Permission', 
            sector: 'unknown', // Invalid sector
            activo: true 
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('noperm');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Should show no access message
      cy.contains('No tienes acceso a ningún módulo').should('be.visible');
      cy.contains('Contacta al administrador para obtener permisos').should('be.visible');
    });
  });

  describe('Logout from HomePage', () => {
    it('should logout successfully', () => {
      // Login first
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 1, username: 'admin', nombre: 'Admin', sector: 'admin', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Click logout
      cy.contains('Cerrar Sesión').click();

      // Should redirect to login
      cy.url().should('include', '/login');

      // localStorage should be cleared
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsedAuth = JSON.parse(authStorage);
          expect(parsedAuth.state.isAuthenticated).to.be.false;
        }
      });
    });
  });
});
