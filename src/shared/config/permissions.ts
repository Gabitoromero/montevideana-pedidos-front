export type Sector = 'ADMIN' | 'CAMARA' | 'CHESS' | 'EXPEDICION' | 'TELEVISOR';

export interface RoutePermission {
  path: string;
  allowedSectors: Sector[];
  label: string;
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Inicio'
  },
  {
    path: '/orders',
    allowedSectors: ['ADMIN', 'CHESS', 'TELEVISOR'],
    label: 'Pedidos'
  },
  {
    path: '/assembly',
    allowedSectors: ['ADMIN', 'CHESS', 'CAMARA', 'EXPEDICION'],
    label: 'Armado de Pedidos'
  },
  {
    path: '/billing',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Facturación'
  },
  {
    path: '/users',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Gestión de Usuarios'
  },
  {
    path: '/users/list',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Lista de Usuarios'
  },
  {
    path: '/users/create',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Crear Usuario'
  },
  {
    path: '/users/edit/:id',
    allowedSectors: ['ADMIN', 'CHESS'], // Todos pueden editar su propio perfil
    label: 'Editar Usuario'
  },
  {
    path: '/fleteros',
    allowedSectors: ['ADMIN', 'CHESS'],
    label: 'Gestión de Fleteros'
  },
  {
    path: '/movimientos',
    allowedSectors: ['ADMIN', 'CHESS', 'EXPEDICION'],
    label: 'Consulta de Movimientos'
  },
  {
    path: '/movimientos/usuario',
    allowedSectors: ['ADMIN', 'CHESS', 'EXPEDICION'],
    label: 'Movimientos por Usuario'
  },
  {
    path: '/movimientos/estado',
    allowedSectors: ['ADMIN', 'CHESS', 'EXPEDICION'],
    label: 'Movimientos por Estado'
  },
  {
    path: '/movimientos/historial',
    allowedSectors: ['ADMIN', 'CHESS', 'EXPEDICION'],
    label: 'Historial de Pedido'
  },
  {
    path: '/movimientos/export',
    allowedSectors: ['ADMIN', 'CHESS', 'EXPEDICION'],
    label: 'Exportar Movimientos'
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


