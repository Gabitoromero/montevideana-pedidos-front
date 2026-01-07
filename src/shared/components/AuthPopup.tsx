import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  orderIdPedido: string;
}

export const AuthPopup: React.FC<AuthPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  orderIdPedido 
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(pin);
      // Reset form
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPin('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-md relative"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 
          className="text-xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Autenticar Movimiento
        </h2>

        {/* Order ID */}
        <p 
          className="text-sm mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Pedido: <span style={{ color: 'var(--accent)' }}>{orderIdPedido}</span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN */}
          <div>
            <label 
              htmlFor="pin"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              PIN
            </label>
            <input
              id="pin"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={isLoading}
              required
              minLength={4}
              maxLength={10}
              placeholder="Ingrese su PIN (4-10 dígitos)"
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded border transition-colors hover:bg-opacity-10 hover:bg-white"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded transition-colors hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)',
              }}
            >
              {isLoading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
