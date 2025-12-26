import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { UserTable } from '../../shared/components/UserTable';
import { userService, type Usuario } from './user.service';

type SectorFilter = 'Todos' | 'admin' | 'armado' | 'facturacion' | 'CHESS';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (sectorFilter === 'Todos') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.sector === sectorFilter));
    }
  }, [sectorFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const isFilterActive = sectorFilter !== 'Todos';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a Gestión de Usuarios</span>
          </button>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Usuarios del Sistema
          </h1>
          <p className="text-[var(--text-secondary)]">
            Lista completa de usuarios registrados
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-4">
          <Filter size={20} className="text-[var(--text-secondary)]" />
          <label htmlFor="sector-filter" className="text-[var(--text-primary)] font-medium">
            Filtrar por sector:
          </label>
          <select
            id="sector-filter"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value as SectorFilter)}
            className={`px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border-2 ${
              isFilterActive
                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border)]'
            } text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200`}
          >
            <option value="Todos">Todos</option>
            <option value="admin">Admin</option>
            <option value="armado">Armado</option>
            <option value="facturacion">Facturación</option>
            <option value="CHESS">CHESS</option>
          </select>
          {isFilterActive && (
            <span className="text-sm text-[var(--accent)] font-semibold">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </span>
          )}
        </div>

        {/* Table Card */}
        <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[var(--error)] mb-4">{error}</p>
              <button
                onClick={loadUsers}
                className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <UserTable users={filteredUsers} onUserClick={handleUserClick} />
          )}
        </Card>
      </div>
    </div>
  );
};
