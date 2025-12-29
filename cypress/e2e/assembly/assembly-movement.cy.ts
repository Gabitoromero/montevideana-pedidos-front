/// <reference types="cypress" />

describe('Assembly Page - Movement Creation', () => {
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

  describe('Auth Popup', () => {
    it('should open auth popup when clicking on order card', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Click on order card
      cy.contains('PED-001').click();

      // Popup should be visible
      cy.contains('Autenticación Requerida').should('be.visible');
      cy.contains('PED-001').should('be.visible');
    });

    it('should display order ID in popup', () => {
      const order = {
        pedido: { idPedido: 'TEST-123', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('TEST-123').click();

      // Popup should show the order ID
      cy.get('[role="dialog"]').within(() => {
        cy.contains('TEST-123').should('be.visible');
      });
    });

    it('should close popup when clicking cancel', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();

      // Click cancel button
      cy.contains('Cancelar').click();

      // Popup should be closed
      cy.contains('Autenticación Requerida').should('not.exist');
    });
  });

  describe('Successful Movement Creation', () => {
    it('should create movement with valid credentials', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { 
          estadoFinal: { id: 1, nombre: 'PENDIENTE' },
          usuario: { username: 'admin' }
        },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 201,
        body: { success: true },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Click order
      cy.contains('PED-001').click();

      // Fill auth form
      cy.get('input[type="text"]').last().type('testuser');
      cy.get('input[type="password"]').last().type('testpass');

      // Submit
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Popup should close
      cy.contains('Autenticación Requerida').should('not.exist');

      // Success notification should appear
      cy.contains('Movimiento creado exitosamente').should('be.visible');
    });

    it('should refresh orders list after successful movement', () => {
      const initialOrder = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      let callCount = 0;
      cy.intercept('GET', '/api/pedidos/estado/1', (req) => {
        callCount++;
        req.reply({
          statusCode: 200,
          body: { data: callCount === 1 ? [initialOrder] : [] },
        });
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 201,
        body: { success: true },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('user');
      cy.get('input[type="password"]').last().type('pass');
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Should make another API call to refresh
      cy.wait('@orders');

      // Order should be gone (moved to next state)
      cy.contains('PED-001').should('not.exist');
    });
  });

  describe('Failed Movement Creation', () => {
    it('should show error notification with invalid credentials', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 401,
        body: { message: 'Credenciales inválidas' },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('wronguser');
      cy.get('input[type="password"]').last().type('wrongpass');
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Popup should close
      cy.contains('Autenticación Requerida').should('not.exist');

      // Error notification should appear
      cy.contains('Credenciales inválidas').should('be.visible');
    });

    it('should show generic error message on server error', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('user');
      cy.get('input[type="password"]').last().type('pass');
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Error notification should appear
      cy.contains('Error al crear el movimiento').should('be.visible');
    });
  });

  describe('Notification Behavior', () => {
    it('should close success notification after timeout', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 201,
        body: { success: true },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('user');
      cy.get('input[type="password"]').last().type('pass');
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Notification should be visible
      cy.contains('Movimiento creado exitosamente').should('be.visible');

      // Wait for auto-close (usually 3-5 seconds)
      cy.wait(5000);

      // Notification should be gone
      cy.contains('Movimiento creado exitosamente').should('not.exist');
    });

    it('should allow manual close of notification', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 201,
        body: { success: true },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('user');
      cy.get('input[type="password"]').last().type('pass');
      cy.contains('button', 'Confirmar').click();

      cy.wait('@createMovement');

      // Click close button on notification (if exists)
      // Note: Adjust selector based on your ResultNotification component
      cy.get('[role="alert"]').within(() => {
        cy.get('button').click();
      });

      // Notification should be gone
      cy.contains('Movimiento creado exitosamente').should('not.exist');
    });
  });

  describe('Edge Cases', () => {
    it('should not create movement when closing popup without submitting', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.intercept('POST', '/api/movimientos', {
        statusCode: 201,
        body: { success: true },
      }).as('createMovement');

      cy.visit('/assembly');
      cy.wait('@orders');

      cy.contains('PED-001').click();
      cy.get('input[type="text"]').last().type('user');
      cy.get('input[type="password"]').last().type('pass');

      // Close without submitting
      cy.contains('Cancelar').click();

      // Should NOT have made API call
      cy.get('@createMovement.all').should('have.length', 0);
    });

    it('should handle rapid clicks on same order', () => {
      const order = {
        pedido: { idPedido: 'PED-001', fechaHora: '2024-01-15T10:00:00Z' },
        ultimoMovimiento: { estadoFinal: { id: 1, nombre: 'PENDIENTE' } },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [order] },
      }).as('orders');

      cy.visit('/assembly');
      cy.wait('@orders');

      // Click multiple times
      cy.contains('PED-001').click();
      cy.contains('PED-001').click();
      cy.contains('PED-001').click();

      // Should only open one popup
      cy.get('[role="dialog"]').should('have.length', 1);
    });
  });
});
