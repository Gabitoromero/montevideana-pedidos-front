import { apiClient } from '../../api/client';
import type { PaginatedOrdersResponse, OrderQueryParams } from './order.types';

/**
 * Obtiene los pedidos que tienen un estado específico con paginación y ordenamiento
 * @param estadoId - ID del estado a filtrar
 * @param params - Parámetros de paginación y ordenamiento
 * @returns Promise con la respuesta paginada de la API
 */
export async function getOrdersByState(
  estadoId: number,
  params: OrderQueryParams = {}
): Promise<PaginatedOrdersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.get<PaginatedOrdersResponse>(
    `/pedidos/estado/${estadoId}/ordered?${queryParams.toString()}`
  );
  return response.data;
}
