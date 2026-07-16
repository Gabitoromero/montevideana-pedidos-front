import { z } from 'zod';

export const configuracionSchema = z.object({
  horaConsultaPreventaManana: z.string().min(1, 'La hora es requerida'),
  queriesRemaining: z.number().int().min(0, 'No puede ser negativo').optional(),
});
