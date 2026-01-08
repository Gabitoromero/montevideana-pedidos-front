// Request body for order evaluation
export interface EvaluationRequest {
  calificacion: number; // 1-5
}

// Response from evaluation endpoint
export interface EvaluationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Rating values and their labels
export const RATING_VALUES = {
  TERRIBLE: 1,
  REGULAR: 2,
  BIEN: 3,
  MUY_BIEN: 4,
  SIN_ERRORES: 5,
} as const;

// Rating labels for UI
export const RATING_LABELS = {
  [RATING_VALUES.TERRIBLE]: 'Terrible',
  [RATING_VALUES.REGULAR]: 'Regular',
  [RATING_VALUES.BIEN]: 'Bien',
  [RATING_VALUES.MUY_BIEN]: 'Muy bien',
  [RATING_VALUES.SIN_ERRORES]: 'Sin errores',
} as const;

// Rating colors when selected
export const RATING_COLORS = {
  [RATING_VALUES.TERRIBLE]: '#ef4444', // Red
  [RATING_VALUES.REGULAR]: '#f97316', // Orange
  [RATING_VALUES.BIEN]: '#eab308', // Yellow
  [RATING_VALUES.MUY_BIEN]: '#84cc16', // Light green
  [RATING_VALUES.SIN_ERRORES]: '#22c55e', // Green
} as const;

// Rating face emojis
export const RATING_FACES = {
  [RATING_VALUES.TERRIBLE]: '😞',
  [RATING_VALUES.REGULAR]: '😕',
  [RATING_VALUES.BIEN]: '😐',
  [RATING_VALUES.MUY_BIEN]: '🙂',
  [RATING_VALUES.SIN_ERRORES]: '😄',
} as const;
