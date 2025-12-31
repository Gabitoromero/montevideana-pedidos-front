/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login with mocked API response
 * @param username - Username to login with
 * @param password - Password to login with
 * @param sector - User sector (admin, CHESS, armado, facturacion)
 * @param nombre - User first name (optional, defaults to 'Test')
 * @param apellido - User last name (optional, defaults to 'User')
 */
Cypress.Commands.add('login', (username: string, password: string, sector: string, nombre?: string, apellido?: string) => {
  // Setup intercept BEFORE visiting the page
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      accessToken: `mock-token-${username}`,
      refreshToken: `mock-refresh-${username}`,
      user: {
        id: Math.floor(Math.random() * 1000),
        username,
        nombre: nombre || 'Test',
        apellido: apellido || 'User',
        sector,
        activo: true,
      },
    },
  }).as('loginRequest');
  
  // Now visit the login page
  cy.visit('/login');
  
  cy.get('input[type="text"]').type(username);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@loginRequest');
});

/**
 * Custom command to mock orders API response
 * @param state - Order state ID (1=PENDIENTE, 2=EN_PREPARACION, 3=PREPARADO)
 * @param orders - Array of order objects
 */
Cypress.Commands.add('mockOrders', (state: number, orders: any[]) => {
  cy.intercept('GET', `/api/pedidos/estado/${state}`, {
    statusCode: 200,
    body: { data: orders },
  }).as(`orders-state-${state}`);
});

/**
 * Custom command to mock all order states at once
 * @param pendingOrders - Orders in PENDIENTE state
 * @param preparingOrders - Orders in EN_PREPARACION state
 * @param preparedOrders - Orders in PREPARADO state
 */
Cypress.Commands.add('mockAllOrders', (pendingOrders: any[], preparingOrders: any[], preparedOrders: any[]) => {
  cy.mockOrders(1, pendingOrders);
  cy.mockOrders(2, preparingOrders);
  cy.mockOrders(3, preparedOrders);
});

/**
 * Custom command to mock users API response
 * @param users - Array of user objects
 */
Cypress.Commands.add('mockUsers', (users: any[]) => {
  cy.intercept('GET', '/api/usuarios', {
    statusCode: 200,
    body: users,
  }).as('users');
});

/**
 * Custom command to mock movement creation
 * @param success - Whether the movement creation should succeed
 * @param errorMessage - Error message if success is false
 */
Cypress.Commands.add('mockMovementCreation', (success: boolean, errorMessage?: string) => {
  if (success) {
    cy.intercept('POST', '/api/movimientos', {
      statusCode: 201,
      body: { success: true },
    }).as('createMovement');
  } else {
    cy.intercept('POST', '/api/movimientos', {
      statusCode: 401,
      body: { message: errorMessage || 'Error al crear movimiento' },
    }).as('createMovement');
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with mocked API response
       * @example cy.login('admin', 'password', 'admin')
       */
      login(username: string, password: string, sector: string, nombre?: string, apellido?: string): Chainable<void>;
      
      /**
       * Custom command to mock orders API response
       * @example cy.mockOrders(1, [order1, order2])
       */
      mockOrders(state: number, orders: any[]): Chainable<void>;
      
      /**
       * Custom command to mock all order states at once
       * @example cy.mockAllOrders([order1], [order2], [order3])
       */
      mockAllOrders(pendingOrders: any[], preparingOrders: any[], preparedOrders: any[]): Chainable<void>;
      
      /**
       * Custom command to mock users API response
       * @example cy.mockUsers([user1, user2])
       */
      mockUsers(users: any[]): Chainable<void>;
      
      /**
       * Custom command to mock movement creation
       * @example cy.mockMovementCreation(true)
       */
      mockMovementCreation(success: boolean, errorMessage?: string): Chainable<void>;
    }
  }
}

export {};
