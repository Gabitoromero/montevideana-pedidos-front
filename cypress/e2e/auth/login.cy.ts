/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  describe('Scenario 1: Successful Login', () => {
    it('should login successfully and redirect to home page', () => {
      // Visit login page
      cy.visit('/login');

      // Mock successful login response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'mock-access-token-123',
          refreshToken: 'mock-refresh-token-456',
          user: {
            id: 1,
            username: 'testuser',
            nombre: 'Test User',
            sector: 'ADMIN',
            activo: true,
          },
        },
      }).as('loginRequest');

      // Fill in the form
      cy.get('input[type="text"]').type('testuser');
      cy.get('input[type="password"]').type('password123');

      // Submit the form
      cy.get('button[type="submit"]').click();

      // Wait for the API call
      cy.wait('@loginRequest');

      // Assert redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Assert localStorage contains auth data
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        expect(authStorage).to.exist;
        
        // Parse and verify the stored data
        const parsedAuth = JSON.parse(authStorage!);
        expect(parsedAuth.state.accessToken).to.equal('mock-access-token-123');
        expect(parsedAuth.state.refreshToken).to.equal('mock-refresh-token-456');
        expect(parsedAuth.state.user).to.exist;
        expect(parsedAuth.state.user.username).to.equal('testuser');
      });
    });
  });

  describe('Scenario 2: Failed Login (401 Error)', () => {
    it('should display error message on failed login', () => {
      // Visit login page
      cy.visit('/login');

      // Mock failed login response (401 Unauthorized)
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials',
        },
      }).as('loginRequest');

      // Fill in the form with invalid credentials
      cy.get('input[type="text"]').type('wronguser');
      cy.get('input[type="password"]').type('wrongpassword');

      // Submit the form
      cy.get('button[type="submit"]').click();

      // Wait for the API call
      cy.wait('@loginRequest');

      // Assert that we're still on the login page
      cy.url().should('include', '/login');

      // Assert error message is displayed
      cy.contains('Credenciales incorrectas o error de conexión').should('be.visible');

      // Assert localStorage does NOT contain auth data
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        // Either null or the storage exists but has no tokens
        if (authStorage) {
          const parsedAuth = JSON.parse(authStorage);
          expect(parsedAuth.state.accessToken).to.be.null;
        }
      });
    });
  });

  describe('UI Elements', () => {
    it('should display all login form elements', () => {
      cy.visit('/login');

      // Check for logo
      cy.get('img[alt="La Montevideana System"]').should('be.visible');

      // Check for form title
      cy.contains('Iniciar Sesión').should('be.visible');

      // Check for input fields
      cy.get('input[type="text"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');

      // Check for submit button
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Iniciar Sesión');
    });

    it('should disable form during submission', () => {
      cy.visit('/login');

      // Mock a delayed response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        delay: 1000,
        body: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          user: { id: 1, username: 'test', nombre: 'Test', sector: 'ADMIN', activo: true },
        },
      }).as('loginRequest');

      cy.get('input[type="text"]').type('testuser');
      cy.get('input[type="password"]').type('password');
      cy.get('button[type="submit"]').click();

      // Check that inputs are disabled during submission
      cy.get('input[type="text"]').should('be.disabled');
      cy.get('input[type="password"]').should('be.disabled');

      // Check button shows loading state
      cy.get('button[type="submit"]').should('contain', 'Ingresando...');
    });
  });
});
