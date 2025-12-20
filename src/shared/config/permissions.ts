export type Sector = 'admin' | 'ventas' | 'armado' | 'facturacion';

export interface RoutePermission {
  path: string;
  allowedSectors: Sector[];
  label: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/',
    allowedSectors: ['admin', 'ventas', 'armado', 'facturacion'],
    label: 'Inicio'
  },
  {
    path: '/orders',
    allowedSectors: ['admin', 'ventas'],
    label: 'Pedidos'
  },
  {
    path: '/assembly',
    allowedSectors: ['admin', 'armado'],
    label: 'Armado de Pedidos'
  },
  {
    path: '/billing',
    allowedSectors: ['admin', 'facturacion'],
    label: 'Facturación'
  },
];

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 * @param userSector - Sector del usuario
 * @param routePath - Ruta a verificar
 * @returns true si el usuario tiene acceso, false en caso contrario
 */
export function hasAccess(userSector: string, routePath: string): boolean {
  const route = ROUTE_PERMISSIONS.find(r => r.path === routePath);
  
  if (!route) {
    return false; // Ruta no definida = sin acceso
  }
  
  return route.allowedSectors.includes(userSector as Sector);
}

/**
 * Obtiene todas las rutas a las que un usuario tiene acceso
 * @param userSector - Sector del usuario
 * @returns Array de rutas permitidas
 */
export function getAccessibleRoutes(userSector: string): RoutePermission[] {
  return ROUTE_PERMISSIONS.filter(route =>
    route.allowedSectors.includes(userSector as Sector)
  );
}
