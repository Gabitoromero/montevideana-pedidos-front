import { ESTADO_IDS } from '../orders/order.types';

// Request to create a movimiento
export interface CreateMovimientoRequest {
  pin: string;
  idPedido: string;
  estadoInicial: number;
  estadoFinal: number;
}

// Response from creating a movimiento
export interface CreateMovimientoResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Helper to get next state based on current state
export function getNextState(currentState: number): number | null {
  const stateTransitions: Record<number, number> = {
    [ESTADO_IDS.PENDIENTE]: ESTADO_IDS.EN_PREPARACION,
    [ESTADO_IDS.EN_PREPARACION]: ESTADO_IDS.PREPARADO,
    [ESTADO_IDS.PREPARADO]: ESTADO_IDS.ENTREGADO,
  };
  
  return stateTransitions[currentState] ?? null;
}

// Available states for filtering in Assembly page
export const ASSEMBLY_FILTER_STATES = [
  { id: ESTADO_IDS.PENDIENTE, name: 'PENDIENTE' },
  { id: ESTADO_IDS.EN_PREPARACION, name: 'EN PREPARACIÓN' },
  { id: ESTADO_IDS.PREPARADO, name: 'PREPARADO' },
] as const;
