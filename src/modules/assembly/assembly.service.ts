import { apiClient } from '../../api/client';
import type { CreateMovimientoRequest, CreateMovimientoResponse } from './assembly.types';
import type { ApiResponse, PedidoConMovimiento } from '../orders/order.types';

/**
 * Creates a new movimiento (state transition) for an order
 * @param request - Contains pin, idPedido, estadoInicial, estadoFinal
 * @returns Promise with the API response
 */
export async function createMovimiento(
  request: CreateMovimientoRequest
): Promise<CreateMovimientoResponse> {
  const response = await apiClient.post<CreateMovimientoResponse>(
    '/movimientos/',
    request
  );
  return response.data;
}

/**
 * Searches for a specific order by its ID
 * @param idPedido - The order ID to search for
 * @returns Promise with the API response containing the order
 */
export async function searchOrderById(
  idPedido: string
): Promise<ApiResponse<PedidoConMovimiento>> {
  const response = await apiClient.get<ApiResponse<PedidoConMovimiento>>(
    `/pedidos/${idPedido}`
  );
  return response.data;
}
