import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CancelOrderWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderIdPedido: string;
}

export const CancelOrderWarningModal: React.FC<CancelOrderWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderIdPedido,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertTriangle size={28} className="text-red-500" />
            <h2 className="text-xl font-bold text-red-500">
              Advertencia: Anular Pedido
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-[var(--text-primary)] text-lg font-semibold mb-3">
              Pedido: <span className="font-mono text-red-500">{orderIdPedido}</span>
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-[var(--text-primary)] font-medium mb-2">
                ⚠️ Esta acción NO se puede revertir
              </p>
              <p className="text-[var(--text-secondary)] text-sm">
                El pedido será marcado como <span className="font-bold text-red-500">ANULADO</span> permanentemente
                y desaparecerá de todas las pantallas de trabajo.
              </p>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              ¿Está seguro de que desea continuar con la anulación de este pedido?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
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
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-red-600 hover:scale-105"
            >
              SIGUIENTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
