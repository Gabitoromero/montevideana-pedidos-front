import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { OrderColumn } from './OrderColumn';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { getOrdersByState } from './orders.service';
import type { PedidoConMovimiento } from './order.types';
import { ESTADO_IDS } from './order.types';

const POLLING_INTERVAL = 5000; // 5 seconds

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
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

    // Initial fetch, then setup polling
    fetchAllOrders().then(() => {
      // Only setup polling if component is still mounted
      if (isMountedRef.current) {
        pollingIntervalRef.current = setInterval(() => {
          fetchAllOrders();
        }, POLLING_INTERVAL);
      }
    });

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
      <FullscreenButton />
      <Sidebar />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors"
        style={{
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--primary)';
          e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      {/* Error Display */}
      {error && (
        <div 
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgb(239, 68, 68)',
          }}
        >
          <AlertCircle size={20} style={{ color: 'rgb(239, 68, 68)' }} />
          <p style={{ color: 'rgb(239, 68, 68)' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--primary)' }}
          />
        </div>
      )}

      {/* Orders Grid - Added top margin to prevent overlap */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: '1rem' }}>
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
