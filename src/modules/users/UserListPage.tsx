import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { UserTable } from '../../shared/components/UserTable';
import { userService, type Usuario } from './user.service';

type SectorFilter = 'Todos' | 'admin' | 'armado' | 'facturacion' | 'CHESS';
type StatusFilter = 'Todos' | 'Activos' | 'Inactivos';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Activos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    // Filter by sector
    if (sectorFilter !== 'Todos') {
      filtered = filtered.filter(u => u.sector === sectorFilter);
    }
    
    // Filter by status
    if (statusFilter === 'Activos') {
      filtered = filtered.filter(u => u.activo);
    } else if (statusFilter === 'Inactivos') {
      filtered = filtered.filter(u => !u.activo);
    }
    
    setFilteredUsers(filtered);
  }, [sectorFilter, statusFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      
      // Asegurar que data es un array
      if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error('getAllUsers did not return an array:', data);
        setUsers([]);
        setFilteredUsers([]);
        setError('Error: formato de datos inválido');
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
      console.error('Error response:', err.response);
      
      // IMPORTANTE: Resetear a arrays vacíos en caso de error
      setUsers([]);
      setFilteredUsers([]);
      
      // Manejar diferentes tipos de errores
      if (err.response?.status === 429) {
        setError('Demasiadas peticiones. Por favor, intenta de nuevo más tarde.');
      } else {
        setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al cargar usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const isFilterActive = sectorFilter !== 'Todos' || statusFilter !== 'Todos';

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
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <Filter size={20} className="text-[var(--text-secondary)]" />
          
          {/* Sector Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="sector-filter" className="text-[var(--text-primary)] font-medium">
              Sector:
            </label>
            <select
              id="sector-filter"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value as SectorFilter)}
              className={`px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border-2 ${
                sectorFilter !== 'Todos'
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
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-[var(--text-primary)] font-medium">
              Estado:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={`px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border-2 ${
                statusFilter !== 'Todos'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)]'
              } text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200`}
            >
              <option value="Todos">Todos</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
          
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
