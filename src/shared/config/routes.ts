import type { Sector } from './permissions';

/**
 * Obtiene la ruta de redirección por defecto según el sector del usuario
 * @param sector - Sector del usuario
 * @returns Ruta a la que debe ser redirigido el usuario
 */
export function getDefaultRouteForSector(sector: Sector | string): string {
  switch (sector) {
    case 'CAMARA':
    case 'EXPEDICION':
      return '/assembly';
    case 'TELEVISOR':
      return '/orders';
    case 'ADMIN':
    case 'CHESS':
    default:
      return '/';
  }
}
