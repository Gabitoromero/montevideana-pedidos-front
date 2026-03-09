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

// Estado asociado al movimiento
export interface MovimientoEstado {
  idEstado: number;
  nombreEstado: string;
}

// Pedido asociado al movimiento
export interface MovimientoPedido {
  idPedido: string;
  fechaHora: string;
  fletero: MovimientoFletero;
}

// Movimiento individual
export interface Movimiento {
  fechaHora: string; // ISO 8601 format
  pedido: MovimientoPedido;
  estadoInicial: MovimientoEstado;
  estadoFinal: MovimientoEstado;
  usuario: MovimientoUsuario;
  motivoAnulacion?: string;
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

// Parámetros de consulta para endpoints con paginación y búsqueda
export interface MovimientoQueryParams {
  fechaInicio?: string; // Formato: YYYY-MM-DD. Obligatorio si no hay idPedido
  fechaFin?: string; // Formato: YYYY-MM-DD (opcional)
  idPedido?: string; // Opcional, anula restricción de fechas si está presente
  idUsuario?: number; // Opcional, ID de usuario
  sector?: string; // Opcional, sector del usuario
  estado?: EstadoPedido; // Opcional, estado final
  search?: string; // Opcional, búsqueda libre (ej. descripción de fletero)
  page?: number; // Default: 1
}

