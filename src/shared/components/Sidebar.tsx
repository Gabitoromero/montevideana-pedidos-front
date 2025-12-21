import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Users, Sun, Moon, Info } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';

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

  return (
    <>
      {/* Hamburger Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-[var(--bg-secondary)] border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:scale-110"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-[var(--text-primary)]" />
        ) : (
          <Menu size={24} className="text-[var(--text-primary)]" />
        )}
      </button>

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
        <div className="flex flex-col h-full pt-20 px-6">
          {/* User Info */}
          <div className="mb-8 pb-6 border-b border-[var(--border)]">
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

          {/* Footer */}
          <div className="pt-6 pb-8 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              La Montevideana System v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
