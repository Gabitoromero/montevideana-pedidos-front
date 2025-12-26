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
          : 'bg-[#2a2a2a] border-gray-600'
      }`}
    >
      {/* Order ID */}
      <div
        className={`text-2xl font-bold mb-3 ${
          isPaid ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {pedido.idPedido}
      </div>

      {/* Fletero */}
      <div className="flex items-start gap-2 mb-2">
        <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-gray-300">{pedido.fletero?.dsFletero || 'Sin fletero'}</span>
      </div>

      {/* Operator */}
      <div className="text-xs text-gray-400 mt-2">
        Op: <span className="text-gray-300">{operatorName}</span>
      </div>
    </div>
  );
};
