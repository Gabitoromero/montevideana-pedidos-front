import React from 'react';
import { User } from 'lucide-react';
import type { PedidoConMovimiento } from './order.types';

interface OrderCardProps {
  order: PedidoConMovimiento;
  isPaid: boolean;
  hideOperator?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, isPaid, hideOperator = false }) => {
  const { pedido, ultimoMovimiento } = order;
  const operatorName = `${ultimoMovimiento.usuario.nombre} ${ultimoMovimiento.usuario.apellido}`;

  return (
    <div
      className={`p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg ${
        isPaid
          ? 'bg-green-900/40 border-green-500'
          : ''
      }`}
      style={!isPaid ? {
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      } : undefined}
    >
      {/* Order ID */}
      <div
        className={`text-xl font-bold mb-2 ${
          isPaid ? 'text-green-400' : ''
        }`}
        style={!isPaid ? { color: 'var(--error)' } : undefined}
      >
        {pedido.idPedido}
      </div>

      {/* Fletero */}
      <div className="flex items-start gap-2 mb-1">
        <User size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{pedido.fletero?.dsFletero || 'Sin fletero'}</span>
      </div>

      {/* Operator - Hidden for PENDIENTE state */}
      {!hideOperator && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Op: <span style={{ color: 'var(--text-secondary)' }}>{operatorName}</span>
        </div>
      )}
    </div>
  );
};
