import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Search, Filter, Calendar, X } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { getCancelledOrders } from '../orders/cancelledOrders.service';
import type { PedidoConMovimiento } from '../orders/order.types';

type FilterType = 'idPedido' | 'fletero' | 'usuario';

export const MovimientosAnuladosPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PedidoConMovimiento[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<FilterType>('idPedido');
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  // Apply filters whenever orders or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [orders, filterType, searchText, filterDate]);

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

  const applyFilters = () => {
    let filtered = [...orders];

    // Filter by search text based on filter type
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      
      filtered = filtered.filter(order => {
        switch (filterType) {
          case 'idPedido':
            return order.pedido.idPedido.toLowerCase().includes(searchLower);
          case 'fletero':
            return order.pedido.fletero?.dsFletero.toLowerCase().includes(searchLower) || false;
          case 'usuario':
            const fullName = `${order.ultimoMovimiento.usuario.nombre} ${order.ultimoMovimiento.usuario.apellido}`.toLowerCase();
            return fullName.includes(searchLower);
          default:
            return true;
        }
      });
    }

    // Filter by date if specified
    if (filterDate) {
      // Parse the date string as local date (YYYY-MM-DD)
      const [year, month, day] = filterDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day); // month is 0-indexed
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.ultimoMovimiento.fechaHora);
        
        // Compare only year, month, and day
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      });
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
    setFilterType('idPedido');
  };

  const hasActiveFilters = searchText !== '' || filterDate !== '';

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

        {/* Filters */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--border)] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-[var(--primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Filtros</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Filtrar por
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="idPedido">ID Pedido</option>
                  <option value="fletero">Fletero</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>

              {/* Search Text */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={
                      filterType === 'idPedido' ? 'Número de pedido...' :
                      filterType === 'fletero' ? 'Nombre del fletero...' :
                      'Nombre del usuario...'
                    }
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-primary)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Fecha (opcional)
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-primary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              Mostrando <span className="font-semibold text-[var(--text-primary)]">{filteredOrders.length}</span> de <span className="font-semibold text-[var(--text-primary)]">{orders.length}</span> pedidos
            </div>
          </div>
        )}

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
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <XCircle size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)]">
                  {orders.length === 0 ? 'No hay pedidos anulados' : 'No se encontraron pedidos con los filtros aplicados'}
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
                        Motivo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                        Cobrado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
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
                        <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs">
                          <span className="line-clamp-2" title={order.ultimoMovimiento.motivoAnulacion || 'Sin motivo'}>
                            {order.ultimoMovimiento.motivoAnulacion || 'Sin motivo'}
                          </span>
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
            {filteredOrders.length > 0 && (
              <div className="px-6 py-4 bg-[var(--bg-lighter)] border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">
                  Total: <span className="font-semibold text-[var(--text-primary)]">{filteredOrders.length}</span> pedido{filteredOrders.length !== 1 ? 's' : ''} anulado{filteredOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
