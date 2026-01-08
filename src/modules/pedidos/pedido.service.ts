import { apiClient } from '../../api/client';
import type { EvaluationRequest, EvaluationResponse } from './pedido.types';

/**
 * Evaluates an order's preparation quality
 * @param idPedido - Order ID (8 digits)
 * @param calificacion - Rating from 1 (terrible) to 5 (sin errores)
 * @returns Promise with the API response
 */
export async function evaluateOrder(
  idPedido: string,
  calificacion: number
): Promise<EvaluationResponse> {
  const request: EvaluationRequest = { calificacion };
  
  const response = await apiClient.patch<EvaluationResponse>(
    `/pedidos/${idPedido}/evaluacion`,
    request
  );
  
  return response.data;
}
