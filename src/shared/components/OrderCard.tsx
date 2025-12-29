import React from 'react';
import { User } from 'lucide-react';
import type { PedidoConMovimiento } from '../../modules/orders/order.types';

interface OrderCardProps {
  order: PedidoConMovimiento;
  onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { pedido } = order;
  const isPaid = pedido.cobrado;

  return (
    <div
      className="p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer hover:scale-105"
      style={{
        backgroundColor: isPaid ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
        borderColor: isPaid ? 'rgb(34, 197, 94)' : 'var(--border)',
        borderLeftWidth: isPaid ? '4px' : '4px'
      }}
      onClick={onClick}
    >
      {/* Order ID */}
      <div
        className="text-2xl font-bold mb-3"
        style={{ color: isPaid ? 'rgb(34, 197, 94)' : 'var(--error)' }}
      >
        {pedido.idPedido}
      </div>

      {/* Fletero */}
      <div className="flex items-start gap-2">
        <User size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{pedido.fletero?.dsFletero || 'Sin fletero'}</span>
      </div>
    </div>
  );
};
