export type Sector = 'admin' | 'armado' | 'facturacion' | 'CHESS';

export interface RoutePermission {
  path: string;
  allowedSectors: Sector[];
  label: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Inicio'
  },
  {
    path: '/orders',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Pedidos'
  },
  {
    path: '/assembly',
    allowedSectors: ['admin', 'CHESS', 'armado'],
    label: 'Armado de Pedidos'
  },
  {
    path: '/billing',
    allowedSectors: ['admin', 'CHESS', 'facturacion'],
    label: 'Facturación'
  },
  {
    path: '/users',
    allowedSectors: ['admin'],
    label: 'Gestión de Usuarios'
  },
  {
    path: '/users/list',
    allowedSectors: ['admin'],
    label: 'Lista de Usuarios'
  },
  {
    path: '/users/create',
    allowedSectors: ['admin'],
    label: 'Crear Usuario'
  },
  {
    path: '/users/edit/:id',
    allowedSectors: ['admin', 'armado', 'facturacion', 'CHESS'], // Todos pueden editar su propio perfil
    label: 'Editar Usuario'
  },
  {
    path: '/fleteros',
    allowedSectors: ['admin'],
    label: 'Gestión de Fleteros'
  },
  {
    path: '/movimientos',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Consulta de Movimientos'
  },
  {
    path: '/movimientos/usuario',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Movimientos por Usuario'
  },
  {
    path: '/movimientos/estado',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Movimientos por Estado'
  },
  {
    path: '/movimientos/historial',
    allowedSectors: ['admin', 'CHESS'],
    label: 'Historial de Pedido'
  },
];

/**
 * Verifica si una ruta con parámetros coincide con un patrón
 * @param pattern - Patrón de ruta (ej: '/users/edit/:id')
 * @param path - Ruta actual (ej: '/users/edit/123')
 * @returns true si coinciden
 */
function matchRoute(pattern: string, path: string): boolean {
  // Si son exactamente iguales, match directo
  if (pattern === path) return true;
  
  // Convertir el patrón en regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Reemplazar :param con regex que captura cualquier cosa excepto /
    .replace(/\//g, '\\/'); // Escapar las barras
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 * @param userSector - Sector del usuario
 * @param routePath - Ruta a verificar
 * @returns true si el usuario tiene acceso, false en caso contrario
 */
export function hasAccess(userSector: string, routePath: string): boolean {
  // Buscar una ruta que coincida (exacta o por patrón)
  const route = ROUTE_PERMISSIONS.find(r => matchRoute(r.path, routePath));
  
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
export function getAccessibleRoutes(userSector: string | undefined): RoutePermission[] {
  if (!userSector) {
    return [];
  }
  
  return ROUTE_PERMISSIONS.filter(route =>
    route.allowedSectors.includes(userSector as Sector)
  );
}


