import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Fletero } from '../../modules/fleteros/fleteros.service';

interface FleterosConfigModalProps {
  isOpen: boolean;
  fletero: Fletero | null;
  onClose: () => void;
  onSave: (seguimiento: boolean, liquidacionManual: boolean) => Promise<void>;
}

export const FleterosConfigModal: React.FC<FleterosConfigModalProps> = ({
  isOpen,
  fletero,
  onClose,
  onSave,
}) => {
  const [seguimiento, setSeguimiento] = useState(false);
  const [liquidacion, setLiquidacion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when fletero changes
  useEffect(() => {
    if (fletero) {
      setSeguimiento(fletero.seguimiento);
      setLiquidacion(fletero.liquidacion);
    }
  }, [fletero]);

  if (!isOpen || !fletero) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(seguimiento, liquidacion);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="rounded-xl p-8 w-full max-w-2xl relative shadow-2xl"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-lighter)] transition-colors disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X size={24} style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-8 pr-10"
          style={{ color: 'var(--text-primary)' }}
        >
          {fletero.dsFletero}
        </h2>

        {/* Horizontal Layout for Both Sections */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Seguimiento Section */}
          <div className="flex flex-col items-center">
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Seguimiento
            </h3>
            <button
              onClick={() => setSeguimiento(!seguimiento)}
              disabled={isLoading}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 mb-4 ${
                seguimiento
                  ? 'bg-green-500 focus:ring-green-500'
                  : 'bg-gray-400 focus:ring-gray-400'
              }`}
              style={{
                backgroundColor: seguimiento ? '#22c55e' : '#9ca3af',
              }}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  seguimiento ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {seguimiento ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Liquidación Section */}
          <div className="flex flex-col items-center">
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Liquidación
            </h3>
            <button
              onClick={() => setLiquidacion(!liquidacion)}
              disabled={isLoading}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 mb-4`}
              style={{
                backgroundColor: liquidacion ? '#22c55e' : '#9ca3af',
              }}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  liquidacion ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {liquidacion ? 'Sí' : 'No'}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 min-w-[200px]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
