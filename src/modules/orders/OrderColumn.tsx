import React from 'react';
import { OrderCard } from './OrderCard';
import type { PedidoConMovimiento } from './order.types';

interface OrderColumnProps {
  title: string;
  orders: PedidoConMovimiento[];
  colorClass: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const OrderColumn: React.FC<OrderColumnProps> = ({
  title,
  orders,
  colorClass,
  hasMore = false,
  onLoadMore,
}) => {
  // Read VITE_DOUBLE_COLUMNS from environment (defaults to 'true')
  const doubleColumns = import.meta.env.VITE_DOUBLE_COLUMNS !== 'false';

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
        className="flex-1 rounded-b-lg p-4 overflow-y-auto min-h-[500px] max-h-[calc(100vh-250px)]"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {orders.length > 0 ? (
          <div className={`grid ${doubleColumns ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {orders.map((order) => {
              // Check if order is paid using the cobrado field
              const isPaid = order.pedido.cobrado;
              
              return (
                <OrderCard
                  key={order.pedido.idPedido}
                  order={order}
                  isPaid={isPaid}
                  hideOperator={title === 'PENDIENTE'}
                />
              );
            })}
            
            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <div className="col-span-full pt-2">
                <button
                  onClick={onLoadMore}
                  className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all font-semibold uppercase tracking-wider text-sm"
                >
                  Ver más
                </button>
              </div>
            )}
          </div>
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
