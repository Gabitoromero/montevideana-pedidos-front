import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Truck, Search } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FleterosTable } from '../../shared/components/FleterosTable';
import { fleterosService, type Fletero } from './fleteros.service';

type FilterType = 'activos' | 'inactivos';

export const FleterosListPage: React.FC = () => {
  const navigate = useNavigate();
  const [fleteros, setFleteros] = useState<Fletero[]>([]);
  const [filter, setFilter] = useState<FilterType>('activos');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFletero, setSelectedFletero] = useState<Fletero | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadFleteros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = filter === 'activos' 
        ? await fleterosService.getActiveFleteros()
        : await fleterosService.getInactiveFleteros();
      setFleteros(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensaje?: string; message?: string } } };
      setError(error.response?.data?.mensaje || error.response?.data?.message || 'Error al cargar fleteros');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadFleteros();
  }, [loadFleteros]);

  const handleFleterosClick = (fletero: Fletero) => {
    setSelectedFletero(fletero);
    setShowModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedFletero) return;

    setIsUpdating(true);
    try {
      await fleterosService.updateSeguimiento(
        selectedFletero.idFletero,
        !selectedFletero.seguimiento
      );
      
      // Reload the list
      await loadFleteros();
      
      setShowModal(false);
      setSelectedFletero(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensaje?: string; message?: string } } };
      setError(error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar seguimiento');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setSelectedFletero(null);
  };

  const isFilterActive = filter === 'inactivos';

  // Filter fleteros by search text (case-insensitive partial match)
  const filteredFleteros = useMemo(() => {
    if (!searchText.trim()) {
      return fleteros;
    }
    const searchLower = searchText.toLowerCase();
    return fleteros.filter(fletero => 
      fletero.dsFletero.toLowerCase().includes(searchLower)
    );
  }, [fleteros, searchText]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Truck size={36} className="text-[var(--primary)]" />
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">
              Gestión de Fleteros
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Administra el seguimiento de fleteros
          </p>
        </div>

        {/* Filter and Search Section */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-[var(--text-secondary)]" />
            <label htmlFor="filter" className="text-[var(--text-primary)] font-medium">
              Filtrar por estado:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className={`px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border-2 ${
                isFilterActive
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)]'
              } text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200`}
            >
              <option value="activos">Activos (Siguiendo)</option>
              <option value="inactivos">Inactivos (No siguiendo)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <Search size={20} className="text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por descripción..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
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

          {/* Results Counter */}
          {(isFilterActive || searchText) && (
            <span className="text-sm text-[var(--accent)] font-semibold">
              Mostrando {filteredFleteros.length} de {fleteros.length} fleteros
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 border-2 border-[var(--error)] rounded-lg">
            <p className="text-[var(--error)] font-medium">{error}</p>
          </div>
        )}

        {/* Table Card */}
        <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--text-secondary)]">Cargando fleteros...</p>
            </div>
          ) : (
            <FleterosTable fleteros={filteredFleteros} onFleterosClick={handleFleterosClick} />
          )}
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedFletero && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card padding="lg" className="max-w-md bg-[var(--bg-secondary)] border-2 border-[var(--primary)]">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Cambiar Estado de Seguimiento
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {selectedFletero.seguimiento ? (
                <>
                  ¿Deseas dejar de seguir a <strong className="text-[var(--text-primary)]">{selectedFletero.dsFletero}</strong>?
                </>
              ) : (
                <>
                  ¿Deseas volver a seguir a <strong className="text-[var(--text-primary)]">{selectedFletero.dsFletero}</strong>?
                </>
              )}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelModal}
                disabled={isUpdating}
                className="flex-1 py-3 px-6 bg-[var(--bg-lighter)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={isUpdating}
                className="flex-1 py-3 px-6 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
