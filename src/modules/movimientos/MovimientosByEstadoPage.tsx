import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Button } from '../../shared/components/Button';
import { MovimientoCard } from './MovimientoCard';
import { movimientoService } from './movimiento.service';
import type { Movimiento, EstadoPedido } from './movimiento.types';

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN PREPARACION', 'PREPARADO', 'PAGADO', 'ENTREGADO'];

export const MovimientosByEstadoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEstado, setSelectedEstado] = useState<EstadoPedido | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!selectedEstado) {
      setError('Debe seleccionar un estado');
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
      const result = await movimientoService.getMovimientosByEstado(selectedEstado as EstadoPedido, {
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
    if (hasSearched && selectedEstado && fechaInicio) {
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
            Buscar por Estado
          </h1>
          <p className="text-[var(--text-secondary)]">
            Consulta los movimientos filtrados por estado de pedido
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de Estado */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Estado <span className="text-[var(--error)]">*</span>
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value as EstadoPedido)}
                className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">Seleccionar estado...</option>
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
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
