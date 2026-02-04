import { apiClient } from '../../api/client';

export interface CancelOrderRequest {
  pin: string;
  idPedido: string;
  estadoInicial: number;
  estadoFinal: 7; // ANULADO
  motivoAnulacion: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Anular un pedido
 * @param request - Datos para anular el pedido (PIN, ID, estados, motivo)
 * @returns Respuesta del servidor
 */
export async function cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse> {
  const response = await apiClient.post<CancelOrderResponse>('/movimientos', request);
  return response.data;
}
