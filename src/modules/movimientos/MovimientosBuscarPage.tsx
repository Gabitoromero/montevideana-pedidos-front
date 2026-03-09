import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { Button } from '../../shared/components/Button';
import { MovimientoCard } from './MovimientoCard';
import { movimientoService } from './movimiento.service';
import { userService } from '../users/user.service';
import type { Movimiento, EstadoPedido } from './movimiento.types';
import type { Usuario } from '../users/user.service';

type SectorFilter = 'Todos' | 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'CHESS';

export const MovimientosBuscarPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Filtros de Búsqueda
  const [idPedido, setIdPedido] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [sectorFilter, setSectorFilter] = useState<SectorFilter | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPedido | ''>('');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | ''>('');
  const [searchText, setSearchText] = useState('');

  // Paginación y Estado
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Cargar usuarios al montar
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsuarios(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      }
    };
    loadUsuarios();
  }, []);

  const handleSearch = async (e?: React.FormEvent, pageStr?: number) => {
    if (e) e.preventDefault();
    
    // Validación Backend requiere o un ID Pedido o una Fecha Inicio
    if (!idPedido && !fechaInicio) {
      setError('Debes ingresar una Fecha de Inicio o un ID de Pedido para buscar.');
      return;
    }

    const targetPage = pageStr || (e ? 1 : currentPage);
    if (e) setCurrentPage(1);

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await movimientoService.getMovimientos({
        idPedido: idPedido.trim() || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        sector: sectorFilter !== 'Todos' && sectorFilter !== '' ? sectorFilter : undefined,
        estado: estadoFilter !== '' ? (estadoFilter as EstadoPedido) : undefined,
        idUsuario: selectedUsuarioId !== '' ? Number(selectedUsuarioId) : undefined,
        search: searchText.trim() || undefined,
        page: targetPage,
      });

      setMovimientos(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Datos del error del backend (Zod):', err.response?.data);
      
      if (err.response?.status === 404) {
        setError('No se encontraron movimientos que coincidan con la búsqueda.');
      } else {
        const backendMessage = err.response?.data?.message || err.response?.data?.error;
        if (Array.isArray(backendMessage)) {
          // Si Zod devuelve un array de errores
          setError(`Error de validación: ${backendMessage.map((m: any) => typeof m === 'string' ? m : m.message).join(', ')}`);
        } else if (typeof backendMessage === 'string') {
          setError(backendMessage);
        } else if (err.response?.data) {
          setError(JSON.stringify(err.response.data));
        } else {
          setError('Error al buscar movimientos. Verifica la consola para más detalles.');
        }
      }
      setMovimientos([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleSearch(undefined, newPage);
  };

  const handleClearFilters = () => {
    setIdPedido('');
    setFechaInicio('');
    setFechaFin('');
    setSectorFilter('');
    setEstadoFilter('');
    setSelectedUsuarioId('');
    setSearchText('');
    setMovimientos([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <FullscreenButton />
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/movimientos')}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Volver al Menú</span>
            </button>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Buscador de Movimientos</h1>
            <p className="text-[var(--text-secondary)]">Consulta avanzada de movimientos con filtros múltiples</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 mb-8 shadow-sm">
          <div className="mb-6 pb-6 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filtros Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">ID Pedido</label>
                <input
                  type="text"
                  placeholder="Ej: 00226957"
                  value={idPedido}
                  onChange={(e) => setIdPedido(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Fecha Inicio {!idPedido && <span className="text-[var(--error)]">*</span>}
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Texto Libre (Fletero, etc.)</label>
                <input
                  type="text"
                  placeholder="Buscar en descripciones..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Filtros Adicionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Sector</label>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as SectorFilter)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Todos los sectores...</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CAMARA">Cámara</option>
                  <option value="EXPEDICION">Expedición</option>
                  <option value="CHESS">CHESS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Estado</label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value as EstadoPedido)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Cualquier estado...</option>
                  <option value="2">Pendiente</option>
                  <option value="3">En Preparación</option>
                  <option value="4">Preparado</option>
                  <option value="5">Tesorería</option>
                  <option value="6">Entregado</option>
                  <option value="7">Anulado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Usuario</label>
                <select
                  value={selectedUsuarioId}
                  onChange={(e) => setSelectedUsuarioId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Cualquier usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido} ({usuario.sector})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-lg text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none">
              <Search size={20} />
              {isLoading ? 'Buscando...' : 'Buscar Movimientos'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters} disabled={isLoading}>
              Limpiar Filtros
            </Button>
          </div>
        </form>

        {/* Resultados */}
        {hasSearched && !isLoading && (
          <>
            {movimientos.length > 0 ? (
              <>
                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <p className="text-[var(--text-secondary)] font-medium">
                    Se encontraron <span className="text-[var(--primary)] font-bold">{total}</span> movimientos.
                    Mostrando página {currentPage} de {totalPages}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {movimientos.map((movimiento, index) => (
                    <MovimientoCard key={index} movimiento={movimiento} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="secondary"
                    >
                      <ChevronLeft size={20} />
                      Anterior
                    </Button>
                    <span className="text-[var(--text-primary)] font-medium">Página {currentPage} de {totalPages}</span>
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
              <div className="text-center py-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
                <Search size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text-secondary)] text-lg">No se encontraron movimientos para los criterios seleccionados.</p>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Consultando base de datos...</p>
          </div>
        )}
      </div>
    </div>
  );
};
