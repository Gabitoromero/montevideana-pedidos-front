import React from 'react';
import { User } from 'lucide-react';
import type { PedidoConMovimiento } from '../orders/order.types';

interface AssemblyOrderCardProps {
  order: PedidoConMovimiento;
  onClick: () => void;
}

export const AssemblyOrderCard: React.FC<AssemblyOrderCardProps> = ({ order, onClick }) => {
  const { pedido, ultimoMovimiento } = order;
  const operatorName = `${ultimoMovimiento.usuario.nombre} ${ultimoMovimiento.usuario.apellido}`;

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
      <div className="flex items-start gap-2 mb-1">
        <User size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{pedido.fletero?.dsFletero || 'Sin fletero'}</span>
      </div>

      {/* Operator */}
      <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
        Op: <span style={{ color: 'var(--text-secondary)' }}>{operatorName}</span>
      </div>
    </div>
  );
};
