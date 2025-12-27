import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { OrderColumn } from './OrderColumn';
import { Sidebar } from '../../shared/components/Sidebar';
import { getOrdersByState } from './orders.service';
import type { PedidoConMovimiento } from './order.types';
import { ESTADO_IDS } from './order.types';

const POLLING_INTERVAL = 60000; // 60 seconds

export const OrdersPage: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PedidoConMovimiento[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<PedidoConMovimiento[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<number | null>(null);

  // Fetch orders for all states
  const fetchAllOrders = async () => {
    try {
      // Clear any previous errors
      setError(null);

      // Fetch all three states in parallel
      const [pendingRes, preparingRes, preparedRes] = await Promise.all([
        getOrdersByState(ESTADO_IDS.PENDIENTE),
        getOrdersByState(ESTADO_IDS.EN_PREPARACION),
        getOrdersByState(ESTADO_IDS.PREPARADO),
      ]);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setPendingOrders(pendingRes.data || []);
        setPreparingOrders(preparingRes.data || []);
        setPreparedOrders(preparedRes.data || []);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Check if it's an auth error (401/403)
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Stop polling immediately to prevent multiple 401 requests
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          // The apiClient interceptor will handle logout and redirect
          setError('Sesión expirada. Redirigiendo al login...');
        } else {
          setError('Error al cargar los pedidos. Reintentando...');
        }
        setIsLoading(false);
      }
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    // Initial fetch
    fetchAllOrders();

    // Setup polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchAllOrders();
    }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Cargando pedidos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ 
            backgroundColor: 'var(--error)', 
            opacity: 0.2,
            border: '1px solid var(--error)'
          }}>
            <AlertCircle style={{ color: 'var(--error)' }} size={24} />
            <span style={{ color: 'var(--error)' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      {!isLoading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <OrderColumn
            title="PENDIENTE"
            orders={pendingOrders}
            colorClass="bg-red-600"
          />
          <OrderColumn
            title="EN PREPARACIÓN"
            orders={preparingOrders}
            colorClass="bg-blue-600"
          />
          <OrderColumn
            title="PREPARADO"
            orders={preparedOrders}
            colorClass="bg-gray-600"
          />
        </div>
      )}
    </div>
  );
};
