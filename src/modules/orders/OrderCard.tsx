import React from 'react';
import { User } from 'lucide-react';
import type { PedidoConMovimiento } from './order.types';

interface OrderCardProps {
  order: PedidoConMovimiento;
  isPaid: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, isPaid }) => {
  const { pedido, ultimoMovimiento } = order;
  const operatorName = `${ultimoMovimiento.usuario.nombre} ${ultimoMovimiento.usuario.apellido}`;

  return (
    <div
      className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg ${
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
        className={`text-2xl font-bold mb-3 ${
          isPaid ? 'text-green-400' : ''
        }`}
        style={!isPaid ? { color: 'var(--error)' } : undefined}
      >
        {pedido.idPedido}
      </div>

      {/* Fletero */}
      <div className="flex items-start gap-2 mb-2">
        <User size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{pedido.fletero?.dsFletero || 'Sin fletero'}</span>
      </div>

      {/* Operator */}
      <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
        Op: <span style={{ color: 'var(--text-secondary)' }}>{operatorName}</span>
      </div>
    </div>
  );
};
