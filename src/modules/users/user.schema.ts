import { z } from 'zod';

export const baseUserSchema = z.object({
  username: z.string()
    .min(4, 'Debe tener al menos 4 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, guiones y puntos (sin espacios)'),
  nombre: z.string()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras y espacios'),
  apellido: z.string()
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras y espacios'),
  sector: z.string().refine(
    (val) => ['ADMIN', 'CAMARA', 'EXPEDICION', 'TELEVISOR', 'CHESS'].includes(val),
    { message: 'Debe seleccionar un sector válido' }
  ),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

export const editUserSchema = baseUserSchema.extend({
  password: z.string().refine(val => val === '' || val.length >= 4, { message: 'La contraseña debe tener al menos 4 caracteres' }),
});
