import React, { useState } from 'react';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface CancelOrderAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string, motivo: string) => void;
  orderIdPedido: string;
}

export const CancelOrderAuthModal: React.FC<CancelOrderAuthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderIdPedido,
}) => {
  const [pin, setPin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Debe ingresar su PIN');
      return;
    }
    
    if (!motivo.trim()) {
      setError('Debe ingresar un motivo de anulación');
      return;
    }

    setError('');
    onSubmit(pin, motivo);
    setPin('');
    setMotivo('');
  };

  const handleClose = () => {
    setPin('');
    setMotivo('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/30 bg-red-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={28} className="text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-red-500">
                Confirmar Anulación
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Pedido: <span className="font-mono font-bold">{orderIdPedido}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* PIN Input */}
          <div className="mb-4">
            <label
              htmlFor="cancel-pin"
              className="block text-sm font-medium text-[var(--text-primary)] mb-2"
            >
              <Lock size={16} className="inline mr-1" />
              PIN del Operario
            </label>
            <input
              id="cancel-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ingrese su PIN"
              className="w-full px-4 py-3 rounded-lg border-2 border-red-500/30 focus:border-red-500 focus:outline-none transition-colors font-mono text-lg"
              style={{
                backgroundColor: 'var(--bg-lighter)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Motivo Input */}
          <div className="mb-6">
            <label
              htmlFor="cancel-motivo"
              className="block text-sm font-medium text-[var(--text-primary)] mb-2"
            >
              Motivo de Anulación <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancel-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Cliente canceló el pedido, Error en el sistema, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-red-500/30 focus:border-red-500 focus:outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--bg-lighter)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Este motivo quedará registrado en el historial del pedido
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-lighter)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border)',
              }}
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-red-600 hover:scale-105"
            >
              CONFIRMAR ANULACIÓN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
