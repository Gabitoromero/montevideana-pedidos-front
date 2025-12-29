import { ESTADO_IDS } from '../orders/order.types';

// Available states for filtering in Billing page
export const BILLING_FILTER_STATES = [
  { id: ESTADO_IDS.PENDIENTE, name: 'PENDIENTE' },
  { id: ESTADO_IDS.EN_PREPARACION, name: 'EN PREPARACIÓN' },
  { id: ESTADO_IDS.PREPARADO, name: 'PREPARADO' },
] as const;

// Target state for billing (PAGADO)
export const PAGADO_STATE_ID = ESTADO_IDS.PAGADO;
