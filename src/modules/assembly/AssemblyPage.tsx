import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { OrderCard } from '../../shared/components/OrderCard';
import { AuthPopup } from '../../shared/components/AuthPopup';
import { EvaluationPopup } from '../../shared/components/EvaluationPopup';
import { ResultNotification } from '../../shared/components/ResultNotification';
import { getOrdersByState } from '../orders/orders.service';

import { createMovimiento } from './assembly.service';
import { getNextState, ASSEMBLY_FILTER_STATES } from './assembly.types';
import { evaluateOrder } from '../pedidos/pedido.service';
import type { PedidoConMovimiento } from '../orders/order.types';
import type { CreateMovimientoRequest } from './assembly.types';
import { ESTADO_IDS } from '../orders/order.types';

export const AssemblyPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<number>(ASSEMBLY_FILTER_STATES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [fleteroSearchQuery, setFleteroSearchQuery] = useState('');
  const [orders, setOrders] = useState<PedidoConMovimiento[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Popup states
  const [selectedOrder, setSelectedOrder] = useState<PedidoConMovimiento | null>(null);
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const currentPinRef = useRef<string>(''); // Store PIN for evaluation using ref

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

  // Filter orders by search query (ID and fletero)
  useEffect(() => {
    let filtered = orders;

    // Filter by ID if search query is not empty
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(order =>
        order.pedido.idPedido.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by fletero if fletero search query is not empty
    if (fleteroSearchQuery.trim() !== '') {
      filtered = filtered.filter(order =>
        order.pedido.fletero.dsFletero.toLowerCase().includes(fleteroSearchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, fleteroSearchQuery, orders]);

  // Handle order card click
  const handleOrderClick = (order: PedidoConMovimiento) => {
    setSelectedOrder(order);
    setIsAuthPopupOpen(true);
  };

  // Handle authentication submission
  const handleAuthSubmit = async (pin: string) => {
    if (!selectedOrder) return;

    const currentState = selectedOrder.ultimoMovimiento.estadoFinal.id;
    const nextState = getNextState(currentState);

    if (nextState === null) {
      showNotification(false, 'No se puede avanzar desde este estado');
      setIsAuthPopupOpen(false);
      return;
    }

    try {
      const request: CreateMovimientoRequest = {
        pin,
        idPedido: selectedOrder.pedido.idPedido,
        estadoInicial: currentState,
        estadoFinal: nextState,
      };

      await createMovimiento(request);
      
      // Close auth popup
      setIsAuthPopupOpen(false);
      
      // Check if this is a PREPARADO -> ENTREGADO transition
      if (nextState === ESTADO_IDS.ENTREGADO) {
        // Store PIN for evaluation and open evaluation popup
        currentPinRef.current = pin;
        setIsEvaluationPopupOpen(true);
      } else {
        // Show success notification for other transitions
        showNotification(true, 'Movimiento creado exitosamente');
        
        // Refresh orders list
        await fetchOrders();
      }
    } catch (err: any) {
      console.error('Error creating movimiento:', err);
      
      // Close auth popup
      setIsAuthPopupOpen(false);
      
      // Show error notification
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al crear el movimiento';
      showNotification(false, errorMessage);
    }
  };

  // Handle evaluation submission
  const handleEvaluationSubmit = async (rating: number) => {
    if (!selectedOrder) return;

    try {
      await evaluateOrder(selectedOrder.pedido.idPedido, rating, currentPinRef.current);
      
      // Close evaluation popup
      setIsEvaluationPopupOpen(false);
      
      // Show success notification
      showNotification(true, 'Pedido evaluado y movimiento creado exitosamente');
      
      // Refresh orders list
      await fetchOrders();
    } catch (err: any) {
      console.error('Error evaluating order:', err);
      
      // Close evaluation popup
      setIsEvaluationPopupOpen(false);
      
      // Show error notification
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al evaluar el pedido';
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
            Cámara
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona los movimientos de estado de los pedidos
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
              {ASSEMBLY_FILTER_STATES.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search by ID */}
          <div className="flex-1 relative">
            <label 
              htmlFor="search"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Search size={16} className="inline mr-1" />
              Buscar por ID
            </label>
            <div className="relative">
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search by Fletero */}
          <div className="flex-1 relative">
            <label 
              htmlFor="fletero-search"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Search size={16} className="inline mr-1" />
              Buscar por fletero
            </label>
            <div className="relative">
              <input
                id="fletero-search"
                type="text"
                value={fleteroSearchQuery}
                onChange={(e) => setFleteroSearchQuery(e.target.value)}
                placeholder="Buscar por fletero..."
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {fleteroSearchQuery && (
                <button
                  onClick={() => setFleteroSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda de fletero"
                >
                  ✕
                </button>
              )}
            </div>
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

      {/* Evaluation Popup */}
      <EvaluationPopup
        isOpen={isEvaluationPopupOpen}
        onSubmit={handleEvaluationSubmit}
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
