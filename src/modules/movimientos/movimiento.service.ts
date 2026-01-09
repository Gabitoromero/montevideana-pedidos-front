import { apiClient } from '../../api/client';
import type {
  EstadoPedido,
  Movimiento,
  MovimientoQueryParams,
  PaginatedMovimientosResponse,
  MovimientosResponse,
} from './movimiento.types';

class MovimientoService {
  /**
   * Obtener movimientos por usuario
   * @param idUsuario - ID numérico del usuario
   * @param params - Parámetros de consulta (fechaInicio, fechaFin opcional, page opcional)
   * @returns Respuesta paginada con movimientos
   */
  async getMovimientosByUsuario(
    idUsuario: number,
    params: MovimientoQueryParams
  ): Promise<{ data: Movimiento[]; pagination: PaginatedMovimientosResponse['data']['pagination'] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('fechaInicio', params.fechaInicio);
    if (params.fechaFin) {
      queryParams.append('fechaFin', params.fechaFin);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }

    const response = await apiClient.get<PaginatedMovimientosResponse>(
      `/movimientos/usuario/${idUsuario}?${queryParams.toString()}`
    );

    return response.data.data;
  }

  /**
   * Obtener movimientos por estado
   * @param estado - Estado del pedido (se URL-encodea automáticamente)
   * @param params - Parámetros de consulta (fechaInicio, fechaFin opcional, page opcional)
   * @returns Respuesta paginada con movimientos
   */
  async getMovimientosByEstado(
    estado: EstadoPedido,
    params: MovimientoQueryParams
  ): Promise<{ data: Movimiento[]; pagination: PaginatedMovimientosResponse['data']['pagination'] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('fechaInicio', params.fechaInicio);
    if (params.fechaFin) {
      queryParams.append('fechaFin', params.fechaFin);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }

    // URL-encode el estado (importante para "EN PREPARACION" -> "EN%20PREPARACION")
    const encodedEstado = encodeURIComponent(estado);

    const response = await apiClient.get<PaginatedMovimientosResponse>(
      `/movimientos/estado/${encodedEstado}?${queryParams.toString()}`
    );

    return response.data.data;
  }

  /**
   * Obtener historial completo de un pedido
   * @param idPedido - ID del pedido de 8 dígitos (ej: "00226957")
   * @returns Array de movimientos (sin paginación)
   */
  async getHistorialPedido(idPedido: string): Promise<Movimiento[]> {
    // URL-encode el ID del pedido por seguridad
    const encodedId = encodeURIComponent(idPedido);

    const response = await apiClient.get<MovimientosResponse>(
      `/movimientos/pedido/${encodedId}/historial`
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
