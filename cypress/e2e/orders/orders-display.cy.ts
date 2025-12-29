/// <reference types="cypress" />

describe('Orders Page - Display', () => {
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

  describe('Column Display', () => {
    it('should display 3 columns with correct titles', () => {
      // Mock API responses for all states
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

      // Navigate to orders page
      cy.visit('/orders');

      // Wait for all API calls
      cy.wait(['@pendingOrders', '@preparingOrders', '@preparedOrders']);

      // Verify column titles
      cy.contains('PENDIENTE').should('be.visible');
      cy.contains('EN PREPARACIÓN').should('be.visible');
      cy.contains('PREPARADO').should('be.visible');

      // Verify grid layout
      cy.get('.grid-cols-1').should('exist');
      cy.get('.md\\:grid-cols-3').should('exist');
    });
  });

  describe('Orders Loading', () => {
    it('should show loading spinner while fetching orders', () => {
      // Mock delayed API responses
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        delay: 1000,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');

      // Should show loading state
      cy.contains('Cargando pedidos...').should('be.visible');
      cy.get('.animate-spin').should('be.visible');
    });

    it('should load and display orders correctly', () => {
      cy.fixture('orders.json').then((orders) => {
        // Separate orders by state
        const pendingOrders = orders.filter((o: any) => o.ultimoMovimiento.estadoFinal.id === 1);
        const preparingOrders = orders.filter((o: any) => o.ultimoMovimiento.estadoFinal.id === 2);
        const preparedOrders = orders.filter((o: any) => o.ultimoMovimiento.estadoFinal.id === 3);

        // Mock API responses
        cy.intercept('GET', '/api/pedidos/estado/1', {
          statusCode: 200,
          body: { data: pendingOrders },
        }).as('pendingOrders');

        cy.intercept('GET', '/api/pedidos/estado/2', {
          statusCode: 200,
          body: { data: preparingOrders },
        }).as('preparingOrders');

        cy.intercept('GET', '/api/pedidos/estado/3', {
          statusCode: 200,
          body: { data: preparedOrders },
        }).as('preparedOrders');

        cy.visit('/orders');

        cy.wait(['@pendingOrders', '@preparingOrders', '@preparedOrders']);

        // Verify orders are displayed
        cy.contains('PED-001').should('be.visible');
        cy.contains('PED-002').should('be.visible');
        cy.contains('PED-003').should('be.visible');
        cy.contains('PED-004').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', () => {
      // Mock failed API responses
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('ordersError');

      cy.visit('/orders');

      cy.wait('@ordersError');

      // Should show error message
      cy.contains('Error al cargar los pedidos').should('be.visible');
    });

    it('should handle 401 error and redirect to login', () => {
      // Mock 401 response
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      }).as('unauthorized');

      cy.visit('/orders');

      cy.wait('@unauthorized');

      // Should show session expired message
      cy.contains('Sesión expirada').should('be.visible');
    });
  });

  describe('Sidebar', () => {
    it('should display sidebar on orders page', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Sidebar should be visible (check for common sidebar elements)
      // Note: Adjust selector based on your actual Sidebar component
      cy.get('aside').should('exist');
    });
  });

  describe('Order Cards', () => {
    it('should display order information correctly', () => {
      const mockOrder = {
        pedido: {
          idPedido: 'TEST-123',
          fechaHora: '2024-01-15T10:30:00Z',
          cliente: 'Test Cliente',
        },
        ultimoMovimiento: {
          id: 1,
          estadoFinal: {
            id: 1,
            nombre: 'PENDIENTE',
          },
          fechaHora: '2024-01-15T10:30:00Z',
          usuario: {
            username: 'testuser',
          },
        },
      };

      cy.intercept('GET', '/api/pedidos/estado/1', {
        statusCode: 200,
        body: { data: [mockOrder] },
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

      // Verify order ID is displayed
      cy.contains('TEST-123').should('be.visible');
    });
  });

  describe('Polling', () => {
    it('should poll for updates every 5 seconds', () => {
      let callCount = 0;

      cy.intercept('GET', '/api/pedidos/estado/*', (req) => {
        callCount++;
        req.reply({
          statusCode: 200,
          body: { data: [] },
        });
      }).as('orders');

      cy.visit('/orders');

      // Wait for initial load (3 calls for 3 states)
      cy.wait('@orders');
      cy.wait('@orders');
      cy.wait('@orders');

      // Wait 5 seconds for next poll
      cy.wait(5500);

      // Should have made additional calls
      cy.get('@orders.all').should('have.length.greaterThan', 3);
    });
  });

  describe('Column Colors', () => {
    it('should display correct colors for each column', () => {
      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Verify column header colors
      // PENDIENTE should have red background
      cy.contains('PENDIENTE').parent().should('have.class', 'bg-red-600');

      // EN PREPARACIÓN should have blue background
      cy.contains('EN PREPARACIÓN').parent().should('have.class', 'bg-blue-600');

      // PREPARADO should have gray background
      cy.contains('PREPARADO').parent().should('have.class', 'bg-gray-600');
    });
  });

  describe('Responsive Layout', () => {
    it('should display single column on mobile', () => {
      cy.viewport('iphone-x');

      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Should have mobile grid class
      cy.get('.grid-cols-1').should('exist');
    });

    it('should display 3 columns on desktop', () => {
      cy.viewport(1280, 720);

      cy.intercept('GET', '/api/pedidos/estado/*', {
        statusCode: 200,
        body: { data: [] },
      }).as('orders');

      cy.visit('/orders');
      cy.wait('@orders');

      // Should have desktop grid class
      cy.get('.md\\:grid-cols-3').should('exist');
    });
  });
});
