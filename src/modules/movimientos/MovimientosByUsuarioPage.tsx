import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Button } from '../../shared/components/Button';
import { MovimientoCard } from './MovimientoCard';
import { movimientoService } from './movimiento.service';
import { userService } from '../users/user.service';
import type { Movimiento } from './movimiento.types';
import type { Usuario } from '../users/user.service';

type SectorFilter = 'Todos' | 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'CHESS' | 'TELEVISOR';
type SearchField = 'nombre' | 'apellido' | 'username';

export const MovimientosByUsuarioPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('Todos');
  const [searchField, setSearchField] = useState<SearchField>('nombre');
  const [searchText, setSearchText] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsuarios(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('Error al cargar la lista de usuarios');
      }
    };
    loadUsuarios();
  }, []);

  // Filter users based on sector, search field, and search text
  const filteredUsuarios = useMemo(() => {
    let filtered = usuarios;

    // Filter by sector
    if (sectorFilter !== 'Todos') {
      filtered = filtered.filter(u => u.sector === sectorFilter);
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(u => {
        const fieldValue = u[searchField]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchLower);
      });
    }

    return filtered;
  }, [usuarios, sectorFilter, searchField, searchText]);

  const handleSearch = async () => {
    if (!selectedUsuarioId) {
      setError('Debe seleccionar un usuario');
      return;
    }
    if (!fechaInicio) {
      setError('Debe ingresar una fecha de inicio');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await movimientoService.getMovimientosByUsuario(selectedUsuarioId, {
        fechaInicio,
        fechaFin: fechaFin || undefined,
        page: currentPage,
      });

      setMovimientos(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: any) {
      console.error('Error al buscar movimientos:', err);
      setError(err.response?.data?.message || 'Error al buscar movimientos');
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Re-buscar cuando cambia la página
  useEffect(() => {
    if (hasSearched && selectedUsuarioId && fechaInicio) {
      handleSearch();
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/movimientos')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a Movimientos</span>
          </button>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Buscar por Usuario
          </h1>
          <p className="text-[var(--text-secondary)]">
            Consulta los movimientos realizados por un usuario específico
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 mb-8">
          {/* Filtros de Usuario */}
          <div className="mb-6 pb-6 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filtrar Usuarios
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sector Filter */}
              <div>
                <label htmlFor="sector-filter" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Sector:
                </label>
                <select
                  id="sector-filter"
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as SectorFilter)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Todos">Todos</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CAMARA">Cámara</option>
                  <option value="EXPEDICION">Expedición</option>
                  <option value="CHESS">CHESS</option>
                  <option value="TELEVISOR">Televisor</option>
                </select>
              </div>

              {/* Search Field Selector */}
              <div>
                <label htmlFor="search-field" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Buscar por:
                </label>
                <select
                  id="search-field"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as SearchField)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="nombre">Nombre</option>
                  <option value="apellido">Apellido</option>
                  <option value="username">Usuario</option>
                </select>
              </div>

              {/* Search Input */}
              <div>
                <label htmlFor="search-text" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Búsqueda:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="search-text"
                    type="text"
                    placeholder="Buscar..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  {searchText && (
                    <button
                      onClick={() => setSearchText('')}
                      className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filtered count */}
            {(sectorFilter !== 'Todos' || searchText.trim()) && (
              <p className="mt-3 text-sm text-[var(--accent)] font-semibold">
                Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
              </p>
            )}
          </div>

          {/* Selector de Usuario y Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Selector de Usuario */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Usuario <span className="text-[var(--error)]">*</span>
              </label>
              <select
                value={selectedUsuarioId || ''}
                onChange={(e) => setSelectedUsuarioId(Number(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">Seleccionar usuario...</option>
                {filteredUsuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido} ({usuario.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Fecha Inicio <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Fecha Fin (opcional)
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Botón de búsqueda */}
          <div className="mt-4">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <Search size={20} />
              {isLoading ? 'Buscando...' : 'Buscar Movimientos'}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-lg">
              <p className="text-[var(--error)] text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Resultados */}
        {hasSearched && !isLoading && (
          <>
            {movimientos.length > 0 ? (
              <>
                {/* Info de resultados */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[var(--text-secondary)]">
                    Mostrando {movimientos.length} de {total} movimientos (Página {currentPage} de {totalPages})
                  </p>
                </div>

                {/* Grid de movimientos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {movimientos.map((movimiento, index) => (
                    <MovimientoCard key={index} movimiento={movimiento} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="secondary"
                    >
                      <ChevronLeft size={20} />
                      Anterior
                    </Button>

                    <span className="text-[var(--text-primary)] font-medium">
                      Página {currentPage} de {totalPages}
                    </span>

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="secondary"
                    >
                      Siguiente
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)] text-lg">
                  No se encontraron movimientos para los criterios seleccionados
                </p>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Buscando movimientos...</p>
          </div>
        )}
      </div>
    </div>
  );
};
