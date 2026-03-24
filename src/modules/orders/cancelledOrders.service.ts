import { apiClient } from '../../api/client';
import type { PaginatedOrdersResponse, OrderQueryParams } from '../orders/order.types';

/**
 * Obtener pedidos anulados con paginación y ordenamiento
 * @param params - Parámetros de paginación y ordenamiento
 * @returns Respuesta paginada de pedidos anulados
 */
export async function getCancelledOrders(
  params: OrderQueryParams = {}
): Promise<PaginatedOrdersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.get<PaginatedOrdersResponse>(
    `/pedidos/anulados?${queryParams.toString()}`
  );
  
  return response.data;
}
