import React from 'react';
import { OrderCard } from './OrderCard';
import type { PedidoConMovimiento } from './order.types';
import { ESTADO_IDS } from './order.types';

interface OrderColumnProps {
  title: string;
  orders: PedidoConMovimiento[];
  colorClass: string;
}

export const OrderColumn: React.FC<OrderColumnProps> = ({
  title,
  orders,
  colorClass,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header - maintains same color regardless of theme */}
      <div
        className={`${colorClass} text-white font-bold text-center py-4 px-6 rounded-t-lg text-lg uppercase tracking-wide`}
      >
        {title}
      </div>

      {/* Orders List - uses CSS variables for theme support */}
      <div 
        className="flex-1 rounded-b-lg p-4 overflow-y-auto space-y-3 min-h-[500px] max-h-[calc(100vh-250px)]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {orders.length > 0 ? (
          orders.map((order) => {
            // Check if order is paid (estado final is PAGADO)
            const isPaid = order.ultimoMovimiento.estadoFinal.id === ESTADO_IDS.PAGADO;
            
            return (
              <OrderCard
                key={order.pedido.idPedido}
                order={order}
                isPaid={isPaid}
              />
            );
          })
        ) : (
          <div 
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No hay pedidos en este estado
          </div>
        )}
      </div>
    </div>
  );
};
