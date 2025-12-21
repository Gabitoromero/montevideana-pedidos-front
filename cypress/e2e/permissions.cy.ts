/// <reference types="cypress" />

/**
 * E2E Tests for Sector-Based Access Control
 * 
 * Tests verify that users from different sectors have appropriate access to routes
 * and that unauthorized access attempts are properly redirected.
 * 
 * Test Users:
 * - goat (admin) - Full access to all routes
 * - romi (admin) - Full access to all routes
 * - peter (armado) - Access to assembly only
 * - marce (facturacion) - Access to billing only
 */

// TODO: Add actual passwords for test users
const TEST_USERS = {
  admin1: {
    username: 'goat',
    password: '1234', // Replace with actual password
    sector: 'admin',
    nombre: 'Lionel',
    apellido: 'Messi'
  },
  admin2: {
    username: 'romi',
    password: '1234', // Replace with actual password
    sector: 'admin',
    nombre: 'Romina',
    apellido: 'Cosci'
  },
  armado: {
    username: 'peter',
    password: '1234', // Replace with actual password
    sector: 'armado',
    nombre: 'Pedro',
    apellido: 'Gonzales'
  },
  facturacion: {
    username: 'marce',
    password: '1234', // Replace with actual password
    sector: 'facturacion',
    nombre: 'Marcela',
    apellido: 'Macia'
  }
};

/**
 * Helper function to login a user
 */
function loginUser(username: string, password: string) {
  cy.visit('/login');
  cy.get('input[type="text"]').clear().type(username);
  cy.get('input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to home page
  cy.url().should('eq', Cypress.config().baseUrl + '/');
}

/**
 * Helper function to logout
 */
function logout() {
  cy.get('button').contains('Cerrar Sesión').click();
  cy.url().should('include', '/login');
}

describe('Sector-Based Access Control', () => {
  
  beforeEach(() => {
    // Clear all storage before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Admin User Access (goat)', () => {
    beforeEach(() => {
      loginUser(TEST_USERS.admin1.username, TEST_USERS.admin1.password);
    });

    afterEach(() => {
      logout();
    });

    it('should successfully login and display user info', () => {
      // Verify user is on home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Verify user name is displayed
      cy.contains(TEST_USERS.admin1.nombre).should('be.visible');
      cy.contains(TEST_USERS.admin1.apellido).should('be.visible');
      cy.contains(TEST_USERS.admin1.sector).should('be.visible');
    });

    it('should access home page', () => {
      cy.visit('/');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Bienvenido').should('be.visible');
    });

    it('should access orders page', () => {
      cy.visit('/orders');
      cy.url().should('eq', Cypress.config().baseUrl + '/orders');
      // Verify we're not redirected to access-denied
      cy.url().should('not.include', '/access-denied');
    });

    it('should access assembly page', () => {
      cy.visit('/assembly');
      cy.url().should('eq', Cypress.config().baseUrl + '/assembly');
      cy.url().should('not.include', '/access-denied');
    });

    it('should access billing page', () => {
      cy.visit('/billing');
      cy.url().should('eq', Cypress.config().baseUrl + '/billing');
      cy.url().should('not.include', '/access-denied');
    });

    it('should access user management page', () => {
      cy.visit('/users');
      cy.url().should('eq', Cypress.config().baseUrl + '/users');
      cy.url().should('not.include', '/access-denied');
      cy.contains('Gestión de Usuarios').should('be.visible');
    });

    it('should see "Gestión de Usuarios" in sidebar', () => {
      cy.visit('/');
      
      // Open sidebar (click hamburger menu)
      cy.get('button[aria-label="Toggle menu"]').click();
      
      // Wait for sidebar to open
      cy.wait(500);
      
      // Verify "Gestión de Usuarios" is visible
      cy.contains('Gestión de Usuarios').should('be.visible');
    });

    it('should be able to navigate to user management via sidebar', () => {
      cy.visit('/');
      
      // Open sidebar
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Click on "Gestión de Usuarios"
      cy.contains('Gestión de Usuarios').click();
      
      // Verify navigation
      cy.url().should('include', '/users');
      cy.contains('Crear Nuevo Usuario').should('be.visible');
    });

    it('should display user creation form on users page', () => {
      cy.visit('/users');
      
      // Verify form elements
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="nombre"]').should('be.visible');
      cy.get('input[name="apellido"]').should('be.visible');
      cy.get('select[name="sector"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Crear Usuario');
    });
  });

  describe('Admin User Access (romi)', () => {
    beforeEach(() => {
      loginUser(TEST_USERS.admin2.username, TEST_USERS.admin2.password);
    });

    afterEach(() => {
      logout();
    });

    it('should have same access as other admin user', () => {
      // Test key routes
      cy.visit('/users');
      cy.url().should('include', '/users');
      cy.url().should('not.include', '/access-denied');
      
      cy.visit('/orders');
      cy.url().should('include', '/orders');
      
      cy.visit('/assembly');
      cy.url().should('include', '/assembly');
      
      cy.visit('/billing');
      cy.url().should('include', '/billing');
    });

    it('should see "Gestión de Usuarios" in sidebar', () => {
      cy.visit('/');
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      cy.contains('Gestión de Usuarios').should('be.visible');
    });
  });

  describe('Armado User Access (peter)', () => {
    beforeEach(() => {
      loginUser(TEST_USERS.armado.username, TEST_USERS.armado.password);
    });

    afterEach(() => {
      logout();
    });

    it('should successfully login and display user info', () => {
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains(TEST_USERS.armado.nombre).should('be.visible');
      cy.contains(TEST_USERS.armado.apellido).should('be.visible');
      cy.contains(TEST_USERS.armado.sector).should('be.visible');
    });

    it('should access assembly page', () => {
      cy.visit('/assembly');
      cy.url().should('eq', Cypress.config().baseUrl + '/assembly');
      cy.url().should('not.include', '/access-denied');
    });

    it('should be redirected from orders page', () => {
      cy.visit('/orders');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should be redirected from billing page', () => {
      cy.visit('/billing');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should be redirected from user management page', () => {
      cy.visit('/users');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should NOT see "Gestión de Usuarios" in sidebar', () => {
      cy.visit('/');
      
      // Open sidebar
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Verify "Gestión de Usuarios" is NOT visible
      cy.contains('Gestión de Usuarios').should('not.exist');
    });

    it('should see theme toggle in sidebar', () => {
      cy.visit('/');
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Theme toggle should be visible for all users
      cy.contains('Tema').should('be.visible');
    });
  });

  describe('Facturacion User Access (marce)', () => {
    beforeEach(() => {
      loginUser(TEST_USERS.facturacion.username, TEST_USERS.facturacion.password);
    });

    afterEach(() => {
      logout();
    });

    it('should successfully login and display user info', () => {
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains(TEST_USERS.facturacion.nombre).should('be.visible');
      cy.contains(TEST_USERS.facturacion.apellido).should('be.visible');
      cy.contains(TEST_USERS.facturacion.sector).should('be.visible');
    });

    it('should access billing page', () => {
      cy.visit('/billing');
      cy.url().should('eq', Cypress.config().baseUrl + '/billing');
      cy.url().should('not.include', '/access-denied');
    });

    it('should be redirected from orders page', () => {
      cy.visit('/orders');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should be redirected from assembly page', () => {
      cy.visit('/assembly');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should be redirected from user management page', () => {
      cy.visit('/users');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });

    it('should NOT see "Gestión de Usuarios" in sidebar', () => {
      cy.visit('/');
      
      // Open sidebar
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Verify "Gestión de Usuarios" is NOT visible
      cy.contains('Gestión de Usuarios').should('not.exist');
    });

    it('should see theme toggle in sidebar', () => {
      cy.visit('/');
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Theme toggle should be visible for all users
      cy.contains('Tema').should('be.visible');
    });
  });

  describe('Theme Toggle Functionality', () => {
    beforeEach(() => {
      loginUser(TEST_USERS.admin1.username, TEST_USERS.admin1.password);
    });

    afterEach(() => {
      logout();
    });

    it('should toggle theme from dark to light', () => {
      cy.visit('/');
      
      // Verify initial theme is dark
      cy.get('html').should('have.class', 'dark');
      
      // Open sidebar
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      
      // Click theme toggle (should show "Tema Claro" in dark mode)
      cy.contains('Tema Claro').click();
      
      // Verify theme changed to light
      cy.get('html').should('have.class', 'light');
      cy.get('html').should('not.have.class', 'dark');
    });

    it('should persist theme after page reload', () => {
      cy.visit('/');
      
      // Open sidebar and toggle to light theme
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.wait(500);
      cy.contains('Tema Claro').click();
      
      // Verify light theme
      cy.get('html').should('have.class', 'light');
      
      // Reload page
      cy.reload();
      
      // Verify theme persisted
      cy.get('html').should('have.class', 'light');
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when accessing protected routes without auth', () => {
      const protectedRoutes = ['/', '/orders', '/assembly', '/billing', '/users'];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });

    it('should allow access to login page without auth', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.contains('Iniciar Sesión').should('be.visible');
    });

    it('should allow access to access-denied page without auth', () => {
      cy.visit('/access-denied');
      cy.url().should('include', '/access-denied');
      cy.contains('Acceso Denegado').should('be.visible');
    });
  });
});
