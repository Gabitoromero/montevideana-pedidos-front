// Estado de pedido - 6 estados válidos
export type EstadoPedido = 'PENDIENTE' | 'EN PREPARACION' | 'PREPARADO' | 'TESORERIA' | 'ENTREGADO' | 'ANULADO';

// Usuario asociado al movimiento
export interface MovimientoUsuario {
  nombre: string;
  apellido: string;
}

// Fletero asociado al pedido del movimiento
export interface MovimientoFletero {
  idFletero: number;
  dsFletero: string;
}

// Movimiento individual
export interface Movimiento {
  fechaHora: string; // ISO 8601 format
  idPedido: string; // Formato: 8 dígitos (ej: "00226957")
  estadoInicial: EstadoPedido;
  estadoFinal: EstadoPedido;
  usuario: MovimientoUsuario;
  fletero: MovimientoFletero;
}

// Objeto de paginación
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respuesta paginada (para endpoints de usuario y estado)
export interface PaginatedMovimientosResponse {
  success: boolean;
  data: {
    data: Movimiento[];
    pagination: Pagination;
  };
}

// Respuesta sin paginación (para historial de pedido)
export interface MovimientosResponse {
  success: boolean;
  data: Movimiento[];
}

// Parámetros de consulta para endpoints con paginación
export interface MovimientoQueryParams {
  fechaInicio: string; // Formato: YYYY-MM-DD
  fechaFin?: string; // Formato: YYYY-MM-DD (opcional)
  page?: number; // Default: 1
}
