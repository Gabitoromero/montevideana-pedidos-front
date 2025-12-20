import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { hasAccess } from '../shared/config/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. Verificar si está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar si tiene acceso a esta ruta según su sector
  if (user && !hasAccess(user.sector, location.pathname)) {
    // Redirigir a página de acceso denegado
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
