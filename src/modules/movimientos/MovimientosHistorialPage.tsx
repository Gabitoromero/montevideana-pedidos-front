import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Button } from '../../shared/components/Button';
import { MovimientoCard } from './MovimientoCard';
import { movimientoService } from './movimiento.service';
import type { Movimiento } from './movimiento.types';

export const MovimientosHistorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [idPedido, setIdPedido] = useState('');
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Validar formato del ID de pedido: XXXX - XXXXXXXX
  const validatePedidoId = (id: string): boolean => {
    const pattern = /^\d{4}\s-\s\d{8}$/;
    return pattern.test(id);
  };

  const handleSearch = async () => {
    if (!idPedido.trim()) {
      setError('Debe ingresar un ID de pedido');
      return;
    }

    if (!validatePedidoId(idPedido)) {
      setError('Formato inválido. Use el formato: XXXX - XXXXXXXX (ejemplo: 0001 - 00284936)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await movimientoService.getHistorialPedido(idPedido);
      setMovimientos(result);
    } catch (err: any) {
      console.error('Error al buscar historial:', err);
      setError(err.response?.data?.message || 'Error al buscar el historial del pedido');
      setMovimientos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
            Historial de Pedido
          </h1>
          <p className="text-[var(--text-secondary)]">
            Consulta todos los movimientos de un pedido específico
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input de ID de Pedido */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                ID de Pedido <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                value={idPedido}
                onChange={(e) => setIdPedido(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ejemplo: 0001 - 00284936"
                className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-mono"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Formato: XXXX - XXXXXXXX
              </p>
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
              {isLoading ? 'Buscando...' : 'Buscar Historial'}
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
                <div className="mb-4">
                  <p className="text-[var(--text-secondary)]">
                    Se encontraron {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''} para el pedido <span className="font-mono font-bold text-[var(--primary)]">{idPedido}</span>
                  </p>
                </div>

                {/* Grid de movimientos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movimientos.map((movimiento, index) => (
                    <MovimientoCard key={index} movimiento={movimiento} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)] text-lg">
                  No se encontraron movimientos para el pedido <span className="font-mono font-bold">{idPedido}</span>
                </p>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Buscando historial...</p>
          </div>
        )}
      </div>
    </div>
  );
};
