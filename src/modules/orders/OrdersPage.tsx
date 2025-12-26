import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, AlertCircle } from 'lucide-react';
import { OrderColumn } from './OrderColumn';
import { LogoutButton } from '../../shared/components/LogoutButton';
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
  const [isLightMode, setIsLightMode] = useState(false);
  
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

  // Toggle light mode
  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <Sidebar />
      <LogoutButton />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Pantalla de Cocina</h1>
          
          {/* Light Mode Toggle */}
          <button
            onClick={toggleLightMode}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#1a1a1a] rounded-lg hover:bg-[#B89A7F] transition-colors font-semibold"
          >
            {isLightMode ? (
              <>
                <Moon size={20} />
                Modo Claro
              </>
            ) : (
              <>
                <Sun size={20} />
                Modo Claro
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          <p className="text-gray-400 mt-4">Cargando pedidos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <span className="text-red-300">{error}</span>
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
