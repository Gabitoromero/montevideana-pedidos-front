import React from 'react';
import type { Movimiento } from './movimiento.types';

interface MovimientosTableProps {
  movimientos: Movimiento[];
}

// Colores para cada estado
const ESTADO_COLORS = {
  CHESS: 'var(--accent)', // Dorado
  PENDIENTE: '#6b7280', // Gris
  'EN PREPARACION': '#3b82f6', // Azul
  PREPARADO: '#8b5cf6', // Púrpura
  'TESORERÍA': '#10b981', // Verde
  ENTREGADO: '#f59e0b', // Naranja
};

export const MovimientosTable: React.FC<MovimientosTableProps> = ({ movimientos }) => {
  // Formatear fecha y hora
  const formatFechaHora = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    return ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] || '#6b7280';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--border)]">
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Fecha y Hora</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">ID Pedido</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Estado Inicial</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Estado Final</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Usuario</th>
          </tr>
        </thead>
        <tbody>
          {!movimientos || movimientos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                No se encontraron movimientos
              </td>
            </tr>
          ) : (
            movimientos.map((movimiento, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] hover:bg-[var(--primary)]/5 transition-colors duration-200"
              >
                {/* Fecha y Hora */}
                <td className="py-4 px-6 text-[var(--text-primary)] font-medium">
                  {formatFechaHora(movimiento.fechaHora)}
                </td>

                {/* ID Pedido */}
                <td className="py-4 px-6">
                  <span className="font-mono font-bold text-[var(--primary)]">
                    {movimiento.idPedido}
                  </span>
                </td>

                {/* Estado Inicial */}
                <td className="py-4 px-6">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${getEstadoColor(movimiento.estadoInicial)}20`,
                      color: getEstadoColor(movimiento.estadoInicial),
                      border: `1px solid ${getEstadoColor(movimiento.estadoInicial)}40`
                    }}
                  >
                    {movimiento.estadoInicial}
                  </span>
                </td>

                {/* Estado Final */}
                <td className="py-4 px-6">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${getEstadoColor(movimiento.estadoFinal)}20`,
                      color: getEstadoColor(movimiento.estadoFinal),
                      border: `1px solid ${getEstadoColor(movimiento.estadoFinal)}40`
                    }}
                  >
                    {movimiento.estadoFinal}
                  </span>
                </td>

                {/* Usuario */}
                <td className="py-4 px-6 text-[var(--text-primary)]">
                  {movimiento.usuario.nombre} {movimiento.usuario.apellido}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
