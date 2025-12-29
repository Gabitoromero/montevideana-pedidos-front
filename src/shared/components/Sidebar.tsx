import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Truck, Sun, Moon, Info, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { authService } from '../../modules/auth/auth.service';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useThemeStore();

  const isAdmin = user?.sector === 'admin';

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Hover trigger area on left edge */}
      {!isOpen && (
        <div
          className="fixed top-0 left-0 w-4 h-full z-30"
          onMouseEnter={() => setIsOpen(true)}
        />
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[var(--bg-secondary)] border-r-2 border-[var(--border)] z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="flex flex-col h-full pt-6 px-6">
          {/* Close button in top-right corner */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-lighter)] transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-[var(--text-primary)]" />
          </button>

          {/* User Info */}
          <div className="mb-8 pb-6 border-b border-[var(--border)] mt-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {user?.nombre} {user?.apellido}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Sector: <span className="text-[var(--primary)] font-semibold">{user?.sector}</span>
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {/* User Management - Only for Admin */}
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/users')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-lighter)] hover:bg-[var(--primary)]/20 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 group"
              >
                <Users size={20} className="text-[var(--primary)] group-hover:text-[var(--primary-light)]" />
                <span className="text-[var(--text-primary)] font-medium">Gestión de Usuarios</span>
              </button>
            )}

            {/* Fleteros Management - Only for Admin */}
            {isAdmin && (
              <button
                onClick={() => handleNavigation('/fleteros')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-lighter)] hover:bg-[var(--primary)]/20 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 group"
              >
                <Truck size={20} className="text-[var(--primary)] group-hover:text-[var(--primary-light)]" />
                <span className="text-[var(--text-primary)] font-medium">Gestión de Fleteros</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-lighter)] hover:bg-[var(--primary)]/20 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 group"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={20} className="text-[var(--accent)] group-hover:text-yellow-400" />
                  <span className="text-[var(--text-primary)] font-medium">Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon size={20} className="text-[var(--primary)] group-hover:text-[var(--primary-light)]" />
                  <span className="text-[var(--text-primary)] font-medium">Tema Oscuro</span>
                </>
              )}
            </button>

            {/* System Info - Placeholder */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-lighter)] hover:bg-[var(--primary)]/20 border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 group opacity-50 cursor-not-allowed"
              disabled
            >
              <Info size={20} className="text-[var(--text-secondary)]" />
              <span className="text-[var(--text-secondary)] font-medium">Info del Sistema</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="pt-4 pb-4 border-t border-[var(--border)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--error)]/10 hover:bg-[var(--error)]/20 border border-[var(--error)]/30 hover:border-[var(--error)] transition-all duration-200 group"
            >
              <LogOut size={20} className="text-[var(--error)] group-hover:text-red-400" />
              <span className="text-[var(--error)] group-hover:text-red-400 font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pb-6">
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              La Montevideana System v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
