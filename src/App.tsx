import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './modules/auth/LoginPage';
import { HomePage } from './modules/home/HomePage';
import { OrdersPage } from './modules/orders/OrdersPage';
import { AssemblyPage } from './modules/assembly/AssemblyPage';
import { BillingPage } from './modules/billing/BillingPage';
import { UserManagementHub } from './modules/users/UserManagementHub';
import { UserListPage } from './modules/users/UserListPage';
import { CreateUserPage } from './modules/users/CreateUserPage';
import { EditUserPage } from './modules/users/EditUserPage';
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

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
