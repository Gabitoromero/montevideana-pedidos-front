import React from 'react';
import { User } from 'lucide-react';
import type { PedidoConMovimiento } from '../orders/order.types';

interface AssemblyOrderCardProps {
  order: PedidoConMovimiento;
  onClick: () => void;
}

export const AssemblyOrderCard: React.FC<AssemblyOrderCardProps> = ({ order, onClick }) => {
  const { pedido } = order;

  return (
    <div
      className="p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer hover:scale-105"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      }}
      onClick={onClick}
    >
      {/* Order ID */}
      <div
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--error)' }}
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
