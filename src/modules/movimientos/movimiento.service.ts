import { apiClient } from '../../api/client';
import type {
  Movimiento,
  MovimientoQueryParams,
  PaginatedMovimientosResponse,
} from './movimiento.types';

class MovimientoService {
  /**
   * Obtener movimientos con búsqueda dinámica (reemplaza búsquedas individuales)
   * @param params - Parámetros de búsqueda (idPedido, fechaInicio, etc.)
   * @returns Respuesta paginada con movimientos
   */
  async getMovimientos(
    params: MovimientoQueryParams
  ): Promise<{ data: Movimiento[]; pagination: PaginatedMovimientosResponse['data']['pagination'] }> {
    const queryParams = new URLSearchParams();
    
    // Add only defined values to URLSearchParams
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, typeof value === 'string' ? value : value.toString());
      }
    });

    const response = await apiClient.get<PaginatedMovimientosResponse>(
      `/movimientos/buscar?${queryParams.toString()}`
    );

    return response.data.data;
  }

  /**
   * Export movements to CSV file
   * @param fechaDesde - Start date (YYYY-MM-DD)
   * @param fechaHasta - End date (YYYY-MM-DD)
   */
  async exportMovimientos(fechaDesde: string, fechaHasta: string): Promise<void> {
    const response = await apiClient.get('/movimientos/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob', // Important for file download
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `movimientos_${fechaDesde}_${fechaHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const movimientoService = new MovimientoService();
