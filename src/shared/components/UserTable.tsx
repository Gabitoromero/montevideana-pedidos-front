import React from 'react';
import type { Usuario } from '../../modules/users/user.service';

interface UserTableProps {
  users: Usuario[];
  onUserClick: (id: number) => void;
}

const SECTOR_COLORS = {
  admin: 'var(--accent)',
  armado: '#3b82f6',
  facturacion: '#10b981',
  CHESS: '#8b5cf6'
};

export const UserTable: React.FC<UserTableProps> = ({ users, onUserClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--border)]">
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Username</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Nombre</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Apellido</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Sector</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {!users || users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onUserClick(user.id)}
                className="border-b border-[var(--border)] hover:bg-[var(--primary)]/10 cursor-pointer transition-colors duration-200"
              >
                <td className="py-4 px-6 text-[var(--text-primary)] font-medium">
                  {user.username}
                </td>
                <td className="py-4 px-6 text-[var(--text-primary)]">
                  {user.nombre}
                </td>
                <td className="py-4 px-6 text-[var(--text-primary)]">
                  {user.apellido}
                </td>
                <td className="py-4 px-6">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${SECTOR_COLORS[user.sector as keyof typeof SECTOR_COLORS]}20`,
                      color: SECTOR_COLORS[user.sector as keyof typeof SECTOR_COLORS],
                      border: `1px solid ${SECTOR_COLORS[user.sector as keyof typeof SECTOR_COLORS]}40`
                    }}
                  >
                    {user.sector}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {user.activo ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40">
                      Activo
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500/20 text-gray-500 border border-gray-500/40">
                      Inactivo
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
