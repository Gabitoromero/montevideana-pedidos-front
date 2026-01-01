import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoginPage } from './modules/auth/LoginPage';
import { HomePage } from './modules/home/HomePage';
import { OrdersPage } from './modules/orders/OrdersPage';
import { AssemblyPage } from './modules/assembly/AssemblyPage';
import { BillingPage } from './modules/billing/BillingPage';
import { UserManagementHub } from './modules/users/UserManagementHub';
import { UserListPage } from './modules/users/UserListPage';
import { CreateUserPage } from './modules/users/CreateUserPage';
import { EditUserPage } from './modules/users/EditUserPage';
import { FleterosListPage } from './modules/fleteros/FleterosListPage';
import { MovimientosIndexPage } from './modules/movimientos/MovimientosIndexPage';
import { MovimientosByUsuarioPage } from './modules/movimientos/MovimientosByUsuarioPage';
import { MovimientosByEstadoPage } from './modules/movimientos/MovimientosByEstadoPage';
import { MovimientosHistorialPage } from './modules/movimientos/MovimientosHistorialPage';
import { NotFoundPage } from './shared/components/NotFoundPage';
import { AccessDeniedPage } from './shared/components/AccessDeniedPage';
import { authService } from './modules/auth/auth.service';

function App() {
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate user on app load
    const validateUser = async () => {
      if (authService.isAuthenticated()) {
        // Refresh user data from backend to sync with server
        await authService.refreshUser();
      }
      setIsValidating(false);
    };

    validateUser();
  }, []);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assembly"
            element={
              <ProtectedRoute>
                <AssemblyPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          
          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagementHub />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/list"
            element={
              <ProtectedRoute>
                <UserListPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/create"
            element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute>
                <EditUserPage />
              </ProtectedRoute>
            }
          />

          {/* Fleteros Management Route */}
          <Route
            path="/fleteros"
            element={
              <ProtectedRoute>
                <FleterosListPage />
              </ProtectedRoute>
            }
          />

          {/* Movimientos Routes */}
          <Route
            path="/movimientos"
            element={
              <ProtectedRoute>
                <MovimientosIndexPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimientos/usuario"
            element={
              <ProtectedRoute>
                <MovimientosByUsuarioPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimientos/estado"
            element={
              <ProtectedRoute>
                <MovimientosByEstadoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimientos/historial"
            element={
              <ProtectedRoute>
                <MovimientosHistorialPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
