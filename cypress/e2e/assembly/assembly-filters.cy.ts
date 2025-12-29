/// <reference types="cypress" />

describe('Assembly Page - Filters', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    
    // Login as admin (has access to assembly)
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

  describe('State Filter', () => {
    it('should display state filter dropdown', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Verify filter label
      cy.contains('Filtrar por estado').should('be.visible');

      // Verify select element
      cy.get('select#state-filter').should('be.visible');
    });

    it('should filter orders by PENDIENTE state', () => {
      const pendingOrders = [
        {
          pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
          ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
        },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: pendingOrders },
      }).as('pendingOrders');

      cy.visit('/assembly');
      cy.wait('@pendingOrders');

      // Select PENDIENTE filter
      cy.get('select#state-filter').select('1');

      // Should show pending order
      cy.contains('PED-001').should('be.visible');
    });

    it('should filter orders by EN_PREPARACION state', () => {
      const preparingOrders = [
        {
          pedido: { idPedido: 'PED-002', fechaHora: '2024-01-15T11:00:00Z' },
          ultimoMovimiento: { estadoFinal: { id: 2, nombre: 'EN_PREPARACION' } },
        },
      ];

      cy.intercept('GET', '/api/pedidos/estado/2', {
        statusCode: 200,
        body: { data: preparingOrders },
      }).as('preparingOrders');

      cy.visit('/assembly');

      // Select EN_PREPARACION filter
      cy.get('select#state-filter').select('2');

      cy.wait('@preparingOrders');

      // Should show preparing order
      cy.contains('PED-002').should('be.visible');
    });

    it('should filter orders by PREPARADO state', () => {
      const preparedOrders = [
        {
          pedido: { idPedido: 'PED-003', fechaHora: '2024-01-15T12:00:00Z' },
          ultimoMovimiento: { estadoFinal: { id: 3, nombre: 'PREPARADO' } },
        },
      ];

      cy.intercept('GET', '/api/pedidos/estado/3', {
        statusCode: 200,
        body: { data: preparedOrders },
      }).as('preparedOrders');

      cy.visit('/assembly');

      // Select PREPARADO filter
      cy.get('select#state-filter').select('3');

      cy.wait('@preparedOrders');

      // Should show prepared order
      cy.contains('PED-003').should('be.visible');
    });

    it('should reload orders when changing filter', () => {
      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [{ pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } }] },
      }).as('state1');

      cy.intercept('GET', '/api/pedidos/estado/2', {
        statusCode: 200,
        body: { data: [{ pedido: { idPedido: 'PED-002' }, ultimoMovimiento: { estadoFinal: { id: 2 } } }] },
      }).as('state2');

      cy.visit('/assembly');
      cy.wait('@state1');

      // Change filter
      cy.get('select#state-filter').select('2');
      cy.wait('@state2');

      // Should show new orders
      cy.contains('PED-002').should('be.visible');
      cy.contains('PED-001').should('not.exist');
    });
  });

  describe('Search Filter', () => {
    it('should display search input', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Verify search label
      cy.contains('Buscar por ID').should('be.visible');

      // Verify search input
      cy.get('input#search').should('be.visible');
      cy.get('input#search').should('have.attr', 'placeholder', 'Ingrese ID del pedido...');
    });

    it('should filter orders by ID search', () => {
      const orders = [
        { pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
        { pedido: { idPedido: 'PED-002' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
        { pedido: { idPedido: 'ABC-123' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: orders },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // All orders should be visible initially
      cy.contains('PED-001').should('be.visible');
      cy.contains('PED-002').should('be.visible');
      cy.contains('ABC-123').should('be.visible');

      // Search for "PED"
      cy.get('input#search').type('PED');

      // Should only show PED orders
      cy.contains('PED-001').should('be.visible');
      cy.contains('PED-002').should('be.visible');
      cy.contains('ABC-123').should('not.exist');
    });

    it('should be case-insensitive', () => {
      const orders = [
        { pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: orders },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Search with lowercase
      cy.get('input#search').type('ped-001');

      // Should still find the order
      cy.contains('PED-001').should('be.visible');
    });

    it('should clear search results when input is cleared', () => {
      const orders = [
        { pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
        { pedido: { idPedido: 'PED-002' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: orders },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Search
      cy.get('input#search').type('PED-001');
      cy.contains('PED-002').should('not.exist');

      // Clear search
      cy.get('input#search').clear();

      // All orders should be visible again
      cy.contains('PED-001').should('be.visible');
      cy.contains('PED-002').should('be.visible');
    });
  });

  describe('Combined Filters', () => {
    it('should combine state filter and search', () => {
      const pendingOrders = [
        { pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
        { pedido: { idPedido: 'ABC-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: pendingOrders },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Apply search filter
      cy.get('input#search').type('PED');

      // Should only show PED order
      cy.contains('PED-001').should('be.visible');
      cy.contains('ABC-001').should('not.exist');
    });
  });

  describe('No Results State', () => {
    it('should show "No se encontraron pedidos" when search has no results', () => {
      const orders = [
        { pedido: { idPedido: 'PED-001' }, ultimoMovimiento: { estadoFinal: { id: 1 } } },
      ];

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: orders },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Search for non-existent order
      cy.get('input#search').type('NONEXISTENT');

      // Should show no results message
      cy.contains('No se encontraron pedidos').should('be.visible');
    });

    it('should show message when state has no orders', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Should show no results message
      cy.contains('No se encontraron pedidos').should('be.visible');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching orders', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        delay: 1000,
        body: { data: [] },
      }).as('orders');

      cy.visit('/assembly');

      // Should show loading
      cy.contains('Cargando pedidos...').should('be.visible');
      cy.get('.animate-spin').should('be.visible');
    });
  });
});
