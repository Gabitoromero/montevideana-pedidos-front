import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { getCancelledOrders } from '../orders/cancelledOrders.service';
import type { PedidoConMovimiento } from '../orders/order.types';

export const MovimientosAnuladosPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  const fetchCancelledOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCancelledOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching cancelled orders:', err);
      setError('Error al cargar los pedidos anulados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <FullscreenButton />
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/movimientos')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <XCircle size={32} className="text-red-500" />
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">
              Pedidos Anulados
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Listado de todos los pedidos que han sido anulados
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" 
              style={{ borderColor: 'var(--accent)' }}
            />
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
              Cargando pedidos anulados...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            className="rounded-lg p-4 mb-6"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgb(239, 68, 68)'
            }}
          >
            <p style={{ color: 'rgb(239, 68, 68)' }}>{error}</p>
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && !error && (
          <div className="bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border)] overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <XCircle size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)]">
                  No hay pedidos anulados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--bg-lighter)] border-b-2 border-[var(--border)]">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        ID Pedido
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        Fletero
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        Fecha Anulación
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        Cobrado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={`${order.pedido.fechaHora}-${order.pedido.idPedido}`}
                        className="border-b border-[var(--border)] hover:bg-[var(--bg-lighter)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-red-500">
                            {order.pedido.idPedido}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-primary)]">
                          {order.pedido.fletero?.dsFletero || 'Sin fletero'}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {new Date(order.ultimoMovimiento.fechaHora).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          {order.ultimoMovimiento.usuario.nombre} {order.ultimoMovimiento.usuario.apellido}
                        </td>
                        <td className="px-6 py-4">
                          {order.pedido.cobrado ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-500">
                              Sí
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-500">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with count */}
            {orders.length > 0 && (
              <div className="px-6 py-4 bg-[var(--bg-lighter)] border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">
                  Total: <span className="font-semibold text-[var(--text-primary)]">{orders.length}</span> pedido{orders.length !== 1 ? 's' : ''} anulado{orders.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
