/// <reference types="cypress" />

describe('Orders Page - Empty State', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    
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
          nombre: 'Admin',
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

  describe('Empty Columns', () => {
    it('should handle empty response for all columns', () => {
      // Mock empty responses for all states
      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [] },
      }).as('pendingOrders');

      cy.intercept('GET', '/api/pedidos/estado/2', {
        statusCode: 200,
        body: { data: [] },
      }).as('preparingOrders');

      cy.intercept('GET', '/api/pedidos/estado/3', {
        statusCode: 200,
        body: { data: [] },
      }).as('preparedOrders');

      cy.visit('/orders');

      cy.wait(['@pendingOrders', '@preparingOrders', '@preparedOrders']);

      // Columns should still be visible
      cy.contains('PENDIENTE').should('be.visible');
      cy.contains('EN PREPARACIÓN').should('be.visible');
      cy.contains('PREPARADO').should('be.visible');

      // No order cards should be displayed
      cy.get('[data-testid="order-card"]').should('not.exist');
    });

    it('should handle null data response', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: null },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Should not crash, columns should still be visible
      cy.contains('PENDIENTE').should('be.visible');
      cy.contains('EN PREPARACIÓN').should('be.visible');
      cy.contains('PREPARADO').should('be.visible');
    });

    it('should handle undefined data response', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: {},
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Should not crash
      cy.contains('PENDIENTE').should('be.visible');
    });
  });

  describe('Partial Empty States', () => {
    it('should display orders only in columns with data', () => {
      const pendingOrder = {
        pedido: {
          idPedido: 'PED-001',
          fechaHora: '2024-01-15T10:30:00Z',
        },
        ultimoMovimiento: {
          estadoFinal: { id: 1, nombre: 'PENDIENTE' },
        },
      };

      // Only pending has data
      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [pendingOrder] },
      }).as('pendingOrders');

      cy.intercept('GET', '/api/pedidos/estado/2', {
        statusCode: 200,
        body: { data: [] },
      }).as('preparingOrders');

      cy.intercept('GET', '/api/pedidos/estado/3', {
        statusCode: 200,
        body: { data: [] },
      }).as('preparedOrders');

      cy.visit('/orders');
      cy.wait(['@pendingOrders', '@preparingOrders', '@preparedOrders']);

      // Should show order in pending column
      cy.contains('PED-001').should('be.visible');

      // Other columns should be empty but visible
      cy.contains('EN PREPARACIÓN').should('be.visible');
      cy.contains('PREPARADO').should('be.visible');
    });
  });

  describe('Empty Array Variations', () => {
    it('should handle empty array []', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      cy.contains('PENDIENTE').should('be.visible');
    });

    it('should handle data: null', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: null },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Should not show error
      cy.contains('Error al cargar los pedidos').should('not.exist');
    });
  });

  describe('Loading to Empty Transition', () => {
    it('should transition from loading to empty state smoothly', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        delay: 500,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');

      // Should show loading first
      cy.contains('Cargando pedidos...').should('be.visible');

      // Wait for requests
      cy.wait('@orders');

      // Loading should disappear
      cy.contains('Cargando pedidos...').should('not.exist');

      // Columns should be visible
      cy.contains('PENDIENTE').should('be.visible');
    });
  });
});
