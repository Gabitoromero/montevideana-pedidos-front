import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { OrderCard } from '../../shared/components/OrderCard';
import { AuthPopup } from '../../shared/components/AuthPopup';
import { ResultNotification } from '../../shared/components/ResultNotification';
import { getOrdersByState } from '../orders/orders.service';
import { createMovimiento } from '../assembly/assembly.service';
import { BILLING_FILTER_STATES, PAGADO_STATE_ID } from './billing.types';
import type { PedidoConMovimiento } from '../orders/order.types';
import type { CreateMovimientoRequest } from '../assembly/assembly.types';

export const BillingPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<number>(BILLING_FILTER_STATES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<PedidoConMovimiento[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Popup states
  const [selectedOrder, setSelectedOrder] = useState<PedidoConMovimiento | null>(null);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch orders by selected state
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getOrdersByState(selectedState);
      setOrders(response.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when state filter changes
  useEffect(() => {
    fetchOrders();
  }, [selectedState]);

  // Filter orders by search query and unpaid status
  useEffect(() => {
    // First filter: only unpaid orders (cobrado: false)
    const unpaidOrders = orders.filter(order => order.pedido.cobrado === false);
    
    // Second filter: search by ID if query exists
    if (searchQuery.trim() === '') {
      setFilteredOrders(unpaidOrders);
    } else {
      const filtered = unpaidOrders.filter(order =>
        order.pedido.idPedido.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  // Handle order card click
  const handleOrderClick = (order: PedidoConMovimiento) => {
    setSelectedOrder(order);
    setIsAuthPopupOpen(true);
  };

  // Handle authentication submission
  const handleAuthSubmit = async (username: string, password: string) => {
    if (!selectedOrder) return;

    const currentState = selectedOrder.ultimoMovimiento.estadoFinal.id;

    try {
      const request: CreateMovimientoRequest = {
        username,
        password,
        idPedido: selectedOrder.pedido.idPedido,
        estadoInicial: currentState,
        estadoFinal: PAGADO_STATE_ID,
      };

      await createMovimiento(request);
      
      // Close auth popup
      setIsAuthPopupOpen(false);
      
      // Show success notification
      showNotification(true, 'Pedido marcado como PAGADO exitosamente');
      
      // Refresh orders list
      await fetchOrders();
    } catch (err: any) {
      console.error('Error creating movimiento:', err);
      
      // Close auth popup
      setIsAuthPopupOpen(false);
      
      // Show error notification
      const errorMessage = err.response?.data?.message || 'Error al marcar el pedido como PAGADO';
      showNotification(false, errorMessage);
    }
  };

  // Show notification helper
  const showNotification = (success: boolean, message: string) => {
    setNotificationSuccess(success);
    setNotificationMessage(message);
    setIsNotificationOpen(true);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Facturación
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Marca los pedidos como PAGADO
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* State Filter */}
          <div className="flex-1">
            <label 
              htmlFor="state-filter"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Filter size={16} className="inline mr-1" />
              Filtrar por estado
            </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(Number(e.target.value))}
              className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {BILLING_FILTER_STATES.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label 
              htmlFor="search"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Search size={16} className="inline mr-1" />
              Buscar por ID
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingrese ID del pedido..."
              className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" 
              style={{ borderColor: 'var(--accent)' }}
            />
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
              Cargando pedidos...
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

        {/* Orders Grid */}
        {!isLoading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <p style={{ color: 'var(--text-secondary)' }}>
                  No se encontraron pedidos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={`${order.pedido.fechaHora}-${order.pedido.idPedido}`}
                    order={order}
                    onClick={() => handleOrderClick(order)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={isAuthPopupOpen}
        onClose={() => setIsAuthPopupOpen(false)}
        onSubmit={handleAuthSubmit}
        orderIdPedido={selectedOrder?.pedido.idPedido || ''}
      />

      {/* Result Notification */}
      <ResultNotification
        isOpen={isNotificationOpen}
        isSuccess={notificationSuccess}
        message={notificationMessage}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};
