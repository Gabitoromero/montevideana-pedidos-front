import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Truck, Search } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { FleterosTable } from '../../shared/components/FleterosTable';
import { FleterosConfigModal } from '../../shared/components/FleterosConfigModal';
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
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationSuccess, setNotificationSuccess] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

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
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async (seguimiento: boolean, liquidacion: boolean) => {
    if (!selectedFletero) return;

    try {
      // Update seguimiento if changed
      if (seguimiento !== selectedFletero.seguimiento) {
        await fleterosService.updateSeguimiento(selectedFletero.idFletero, seguimiento);
      }

      // Update liquidacion if changed
      if (liquidacion !== selectedFletero.liquidacion) {
        await fleterosService.updateLiquidacion(selectedFletero.idFletero, liquidacion);
      }

      setIsConfigModalOpen(false);
      setSelectedFletero(null);
      
      // Show success notification
      displayNotification(true, 'Configuración actualizada exitosamente');
      
      // Reload the list
      await loadFleteros();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensaje?: string; message?: string } } };
      const errorMessage = error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar la configuración';
      displayNotification(false, errorMessage);
    }
  };

  const displayNotification = (success: boolean, message: string) => {
    setNotificationSuccess(success);
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
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
      <FullscreenButton />
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Truck size={36} className="text-[var(--primary)]" />
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">
              Gestión de Transportes
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Administra el seguimiento de transportes
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

      {/* Configuration Modal */}
      <FleterosConfigModal
        isOpen={isConfigModalOpen}
        fletero={selectedFletero}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedFletero(null);
        }}
        onSave={handleSaveConfig}
      />

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg border-2 ${
              notificationSuccess
                ? 'bg-green-500/10 border-green-500 text-green-600'
                : 'bg-red-500/10 border-red-500 text-red-600'
            }`}
          >
            <p className="font-semibold">{notificationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
