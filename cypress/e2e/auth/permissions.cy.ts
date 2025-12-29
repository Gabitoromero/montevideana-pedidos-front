/// <reference types="cypress" />

describe('Permissions & Access Control', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Admin User Permissions', () => {
    it('should show all options for admin user', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'admin-token',
          refreshToken: 'admin-refresh',
          user: {
            id: 1,
            username: 'admin',
            nombre: 'Admin',
            apellido: 'User',
            sector: 'admin',
            activo: true,
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Should be on home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Verify welcome message
      cy.contains('Bienvenido, Admin User').should('be.visible');
      cy.contains('admin').should('be.visible');

      // Admin should see all 3 main cards
      cy.contains('h3', 'Pedidos').should('be.visible');
      cy.contains('h3', 'Armado de Pedidos').should('be.visible');
      cy.contains('h3', 'Facturación').should('be.visible');

      // Verify exactly 3 cards
      cy.get('.grid').find('.cursor-pointer').should('have.length', 3);
    });

    it('should allow admin to access all routes', () => {
      // Login as admin
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

      // Test access to /orders
      cy.visit('/orders');
      cy.url().should('include', '/orders');
      cy.url().should('not.include', '/access-denied');

      // Test access to /assembly
      cy.visit('/assembly');
      cy.url().should('include', '/assembly');
      cy.url().should('not.include', '/access-denied');

      // Test access to /billing
      cy.visit('/billing');
      cy.url().should('include', '/billing');
      cy.url().should('not.include', '/access-denied');

      // Test access to /users (admin only)
      cy.visit('/users');
      cy.url().should('include', '/users');
      cy.url().should('not.include', '/access-denied');
    });
  });

  describe('CHESS User Permissions', () => {
    it('should show 3 options for CHESS user', () => {
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

      // Verify sector display
      cy.contains('CHESS').should('be.visible');

      // CHESS should see 3 cards
      cy.contains('h3', 'Pedidos').should('be.visible');
      cy.contains('h3', 'Armado de Pedidos').should('be.visible');
      cy.contains('h3', 'Facturación').should('be.visible');

      cy.get('.grid').find('.cursor-pointer').should('have.length', 3);
    });

    it('should deny CHESS user access to /users', () => {
      // Login as CHESS
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

      // Try to access /users
      cy.visit('/users');

      // Should redirect to access-denied
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
      cy.contains('No tienes permisos para acceder a esta página').should('be.visible');
    });
  });

  describe('Armado User Permissions', () => {
    it('should redirect armado user directly to /assembly', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'armado-token',
          refreshToken: 'armado-refresh',
          user: {
            id: 3,
            username: 'armador',
            nombre: 'Armador',
            apellido: 'User',
            sector: 'armado',
            activo: true,
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('armador');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Should redirect to /assembly
      cy.url().should('include', '/assembly');
    });

    it('should deny armado user access to other routes', () => {
      // Login as armado
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

      // Try to access /orders
      cy.visit('/orders');
      cy.url().should('include', '/access-denied');

      // Try to access /billing
      cy.visit('/billing');
      cy.url().should('include', '/access-denied');

      // Try to access /users
      cy.visit('/users');
      cy.url().should('include', '/access-denied');
    });
  });

  describe('Facturacion User Permissions', () => {
    it('should redirect facturacion user directly to /billing', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'billing-token',
          refreshToken: 'billing-refresh',
          user: {
            id: 4,
            username: 'facturador',
            nombre: 'Facturador',
            apellido: 'User',
            sector: 'facturacion',
            activo: true,
          },
        },
      }).as('login');

      cy.get('input[type="text"]').type('facturador');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Should redirect to /billing
      cy.url().should('include', '/billing');
    });

    it('should deny facturacion user access to other routes', () => {
      // Login as facturacion
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

      // Try to access /orders
      cy.visit('/orders');
      cy.url().should('include', '/access-denied');

      // Try to access /assembly
      cy.visit('/assembly');
      cy.url().should('include', '/access-denied');

      // Try to access /users
      cy.visit('/users');
      cy.url().should('include', '/access-denied');
    });
  });

  describe('Access Denied Page', () => {
    it('should display access denied page correctly', () => {
      // Login as armado (limited permissions)
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

      // Try to access forbidden route
      cy.visit('/orders');

      // Verify access denied page elements
      cy.contains('Acceso Denegado').should('be.visible');
      cy.contains('No tienes permisos para acceder a esta página').should('be.visible');
      cy.contains('Contacta al administrador si crees que esto es un error').should('be.visible');

      // Verify icon is visible
      cy.get('svg').should('be.visible');

      // Verify "Volver al Inicio" button
      cy.contains('Volver al Inicio').should('be.visible');
    });

    it('should navigate back to login from access denied page', () => {
      // Login as armado
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

      // Access forbidden route
      cy.visit('/orders');

      // Click "Volver al Inicio"
      cy.contains('Volver al Inicio').click();

      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      // Try to access protected route without logging in
      cy.visit('/orders');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should redirect to login for all protected routes', () => {
      const protectedRoutes = ['/orders', '/assembly', '/billing', '/users'];

      protectedRoutes.forEach((route) => {
        cy.clearLocalStorage();
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });
  });
});
