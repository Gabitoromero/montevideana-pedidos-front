// Estado de un pedido
export interface Estado {
  id: number;
  nombreEstado: string;
}

// Usuario que realizó el movimiento
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
}

// Movimiento de cambio de estado
export interface Movimiento {
  fechaHora: string;
  estadoInicial: Estado;
  estadoFinal: Estado;
  usuario: Usuario;
}

// Datos del pedido
export interface Pedido {
  fechaHora: string;
  idPedido: string;
  cobrado: boolean;
  fletero: {
    dsFletero: string;
  };
}

// Pedido con su último movimiento
export interface PedidoConMovimiento {
  pedido: Pedido;
  ultimoMovimiento: Movimiento;
}

// Respuesta genérica de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// IDs de estados para referencia
export const ESTADO_IDS = {
  CHESS: 1,
  PENDIENTE: 2,
  EN_PREPARACION: 3,
  PREPARADO: 4,
  TESORERIA: 5,
  ENTREGADO: 6,
} as const;

// Nombres de estados para UI
export const ESTADO_NOMBRES = {
  [ESTADO_IDS.CHESS]: 'CHESS',
  [ESTADO_IDS.PENDIENTE]: 'PENDIENTE',
  [ESTADO_IDS.EN_PREPARACION]: 'EN PREPARACIÓN',
  [ESTADO_IDS.PREPARADO]: 'PREPARADO',
  [ESTADO_IDS.TESORERIA]: 'TESORERIA',
  [ESTADO_IDS.ENTREGADO]: 'ENTREGADO',
} as const;
