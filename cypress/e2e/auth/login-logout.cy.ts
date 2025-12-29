/// <reference types="cypress" />

describe('Login & Logout Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit('/login');

      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 1,
            username: 'admin',
            nombre: 'Admin',
            apellido: 'User',
            sector: 'admin',
            activo: true,
          },
        },
      }).as('loginRequest');

      // Fill form
      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Wait for request
      cy.wait('@loginRequest');

      // Verify redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Verify localStorage
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        expect(authStorage).to.exist;
        
        const parsedAuth = JSON.parse(authStorage!);
        expect(parsedAuth.state.accessToken).to.equal('mock-access-token');
        expect(parsedAuth.state.isAuthenticated).to.be.true;
      });
    });

    it('should persist session after page reload', () => {
      // Login first
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          user: { id: 1, username: 'test', nombre: 'Test', sector: 'admin', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('test');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Reload page
      cy.reload();

      // Should still be on home page
      cy.url().should('include', '/');
      
      // Verify localStorage still has data
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        expect(authStorage).to.exist;
      });
    });
  });

  describe('Failed Login', () => {
    it('should show error message with invalid credentials', () => {
      cy.visit('/login');

      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' },
      }).as('loginRequest');

      cy.get('input[type="text"]').type('wronguser');
      cy.get('input[type="password"]').type('wrongpass');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      // Should stay on login page
      cy.url().should('include', '/login');

      // Error message should be visible
      cy.contains('Credenciales incorrectas o error de conexión').should('be.visible');

      // localStorage should not have auth data
      cy.window().then((window) => {
        const authStorage = window.localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsedAuth = JSON.parse(authStorage);
          expect(parsedAuth.state.isAuthenticated).to.be.false;
        }
      });
    });

    it('should validate empty fields', () => {
      cy.visit('/login');

      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();

      // Should still be on login page (HTML5 validation prevents submission)
      cy.url().should('include', '/login');
    });
  });

  describe('Logout', () => {
    it('should logout from home page', () => {
      // Login first
      cy.visit('/login');
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 1, username: 'test', nombre: 'Test', sector: 'admin', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('test');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();
      cy.wait('@login');

      // Click logout button
      cy.contains('Cerrar Sesión').should('be.visible').click();

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

  describe('Auto-redirect', () => {
    it('should redirect to home if already authenticated', () => {
      // Set auth data in localStorage
      cy.window().then((window) => {
        const authData = {
          state: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            user: { id: 1, username: 'test', nombre: 'Test', sector: 'admin', activo: true },
            isAuthenticated: true,
          },
          version: 0,
        };
        window.localStorage.setItem('auth-storage', JSON.stringify(authData));
      });

      // Try to visit login page
      cy.visit('/login');

      // Should redirect to home (or appropriate page based on sector)
      // Note: This depends on your app's routing logic
      cy.url().should('not.include', '/login');
    });
  });

  describe('UI Elements', () => {
    it('should display all login form elements', () => {
      cy.visit('/login');

      // Logo
      cy.get('img[alt="La Montevideana System"]').should('be.visible');

      // Title
      cy.contains('Iniciar Sesión').should('be.visible');

      // Input fields
      cy.get('input[type="text"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');

      // Submit button
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show loading state during login', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        delay: 1000,
        body: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: 1, username: 'test', nombre: 'Test', sector: 'admin', activo: true },
        },
      }).as('login');

      cy.get('input[type="text"]').type('test');
      cy.get('input[type="password"]').type('pass');
      cy.get('button[type="submit"]').click();

      // Check loading state
      cy.get('button[type="submit"]').should('contain', 'Ingresando...');
      cy.get('input[type="text"]').should('be.disabled');
      cy.get('input[type="password"]').should('be.disabled');
    });
  });
});
