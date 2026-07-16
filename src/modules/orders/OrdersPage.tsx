import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { OrderColumn } from './OrderColumn';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { getOrdersByState } from './orders.service';
import type { PedidoConMovimiento } from './order.types';
import { ESTADO_IDS } from './order.types';
import { useNewOrderAlarm } from './hooks/useNewOrderAlarm';

const POLLING_INTERVAL = 5000; // 5 seconds

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState<PedidoConMovimiento[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<PedidoConMovimiento[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<PedidoConMovimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for each column
  const [paginationInfo, setPaginationInfo] = useState({
    [ESTADO_IDS.PENDIENTE]: { page: 1, totalPages: 1 },
    [ESTADO_IDS.EN_PREPARACION]: { page: 1, totalPages: 1 },
    [ESTADO_IDS.PREPARADO]: { page: 1, totalPages: 1 },
  });
  
  // Use ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<number | null>(null);
  const { notificarPedidosPendientes } = useNewOrderAlarm();

  // Fetch orders for all states
  const fetchAllOrders = useCallback(async () => {
    try {
      // Clear any previous errors
      setError(null);

      // Fetch all three states in parallel (always fetch page 1 for polling)
      const [pendingRes, preparingRes, preparedRes] = await Promise.all([
        getOrdersByState(ESTADO_IDS.PENDIENTE, { page: 1, limit: 50 }),
        getOrdersByState(ESTADO_IDS.EN_PREPARACION, { page: 1, limit: 50 }),
        getOrdersByState(ESTADO_IDS.PREPARADO, { page: 1, limit: 50 }),
      ]);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setPendingOrders(pendingRes.data.data);
        setPreparingOrders(preparingRes.data.data);
        setPreparedOrders(preparedRes.data.data);
        notificarPedidosPendientes(pendingRes.data.data.map((o) => o.pedido.idPedido));
        
        setPaginationInfo({
          [ESTADO_IDS.PENDIENTE]: { 
            page: pendingRes.data.pagination.page, 
            totalPages: pendingRes.data.pagination.totalPages 
          },
          [ESTADO_IDS.EN_PREPARACION]: { 
            page: preparingRes.data.pagination.page, 
            totalPages: preparingRes.data.pagination.totalPages 
          },
          [ESTADO_IDS.PREPARADO]: { 
            page: preparedRes.data.pagination.page, 
            totalPages: preparedRes.data.pagination.totalPages 
          },
        });
        
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('Error fetching orders:', err);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Check if it's an auth error (401/403)
        const errorResponse = (err as { response?: { status?: number } })?.response;
        if (errorResponse?.status === 401 || errorResponse?.status === 403) {
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
  }, [notificarPedidosPendientes]);

  // Function to load more orders for a specific state
  const handleLoadMore = async (estadoId: number) => {
    const nextPage = paginationInfo[estadoId as keyof typeof paginationInfo].page + 1;
    
    try {
      const response = await getOrdersByState(estadoId, { page: nextPage, limit: 50 });
      
      if (isMountedRef.current) {
        const newData = response.data.data;
        const newPagination = response.data.pagination;

        if (estadoId === ESTADO_IDS.PENDIENTE) {
          setPendingOrders(prev => [...prev, ...newData]);
        } else if (estadoId === ESTADO_IDS.EN_PREPARACION) {
          setPreparingOrders(prev => [...prev, ...newData]);
        } else if (estadoId === ESTADO_IDS.PREPARADO) {
          setPreparedOrders(prev => [...prev, ...newData]);
        }

        setPaginationInfo(prev => ({
          ...prev,
          [estadoId]: { page: newPagination.page, totalPages: newPagination.totalPages }
        }));
      }
    } catch (err) {
      console.error(`Error loading more orders for state ${estadoId}:`, err);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    const initPolling = async () => {
      await fetchAllOrders();
      // Only setup polling if component is still mounted
      if (isMountedRef.current) {
        pollingIntervalRef.current = window.setInterval(() => {
          fetchAllOrders();
        }, POLLING_INTERVAL);
      }
    };
    
    void initPolling();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchAllOrders]);

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
            hasMore={paginationInfo[ESTADO_IDS.PENDIENTE].page < paginationInfo[ESTADO_IDS.PENDIENTE].totalPages}
            onLoadMore={() => handleLoadMore(ESTADO_IDS.PENDIENTE)}
          />
          <OrderColumn
            title="EN PREPARACIÓN"
            orders={preparingOrders}
            colorClass="bg-blue-600"
            hasMore={paginationInfo[ESTADO_IDS.EN_PREPARACION].page < paginationInfo[ESTADO_IDS.EN_PREPARACION].totalPages}
            onLoadMore={() => handleLoadMore(ESTADO_IDS.EN_PREPARACION)}
          />
          <OrderColumn
            title="PREPARADO"
            orders={preparedOrders}
            colorClass="bg-gray-600"
            hasMore={paginationInfo[ESTADO_IDS.PREPARADO].page < paginationInfo[ESTADO_IDS.PREPARADO].totalPages}
            onLoadMore={() => handleLoadMore(ESTADO_IDS.PREPARADO)}
          />
        </div>
      )}
    </div>
  );
};
