import { apiClient } from '../../api/client';
import type { ApiResponse, PedidoConMovimiento } from './order.types';

/**
 * Obtiene todos los pedidos que tienen un estado específico, ordenados por idPedido
 * @param estadoId - ID del estado a filtrar (1=CHESS, 2=PENDIENTE, 3=EN PREPARACION, 4=PREPARADO, 5=TESORERÍA, 6=ENTREGADO)
 * @returns Promise con la respuesta de la API conteniendo el array de pedidos ordenados
 */
export async function getOrdersByState(
  estadoId: number
): Promise<ApiResponse<PedidoConMovimiento[]>> {
  const response = await apiClient.get<ApiResponse<PedidoConMovimiento[]>>(
    `/pedidos/estado/${estadoId}/ordered`
  );
  return response.data;
}
