/**
 * Objeto de paginación estándar para toda la aplicación
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Parámetros comunes de consulta para endpoints con paginación
 */
export interface PaginationQueryParams {
  page?: number;     // Página actual (1-indexed)
  limit?: number;    // Cantidad de registros por página
  sortBy?: string;   // Campo por el cual ordenar
  sortOrder?: 'ASC' | 'DESC'; // Dirección del ordenamiento
}

/**
 * Estructura de respuesta paginada genérica
 */
export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}
