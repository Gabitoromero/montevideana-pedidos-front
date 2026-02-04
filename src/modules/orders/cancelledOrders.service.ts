import { apiClient } from '../../api/client';
import type { PedidoConMovimiento } from '../orders/order.types';

interface CancelledOrdersResponse {
  success: boolean;
  data: PedidoConMovimiento[];
}

/**
 * Obtener todos los pedidos anulados
 * @returns Lista de pedidos anulados
 */
export async function getCancelledOrders(): Promise<PedidoConMovimiento[]> {
  const response = await apiClient.get<CancelledOrdersResponse>('/pedidos/anulados');
  
  // El backend devuelve { success: true, data: [...] }
  // Pero axios ya extrae response.data, así que accedemos a response.data.data
  return response.data.data || [];
}
