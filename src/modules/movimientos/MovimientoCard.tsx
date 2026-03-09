import React from 'react';
import { Card } from '../../shared/components/Card';
import type { Movimiento } from './movimiento.types';
import { ArrowRight } from 'lucide-react';

interface MovimientoCardProps {
  movimiento: Movimiento;
}

export const MovimientoCard: React.FC<MovimientoCardProps> = ({ movimiento }) => {
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

  return (
    <Card
      padding="md"
      className="bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Fecha y Hora */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <span className="text-sm text-[var(--text-secondary)]">Fecha y Hora</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {formatFechaHora(movimiento.fechaHora)}
          </span>
        </div>

        {/* ID Pedido */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">Pedido</span>
          <span className="text-sm font-mono font-bold text-[var(--primary)]">
            {movimiento.pedido.idPedido}
          </span>
        </div>

        {/* Transición de Estado */}
        <div className="bg-[var(--bg-lighter)] rounded-lg p-3">
          <div className="flex items-center justify-center gap-3 space-x-2">
            <span className="px-3 py-1 rounded-full bg-[var(--error)]/20 text-[var(--error)] text-xs font-semibold text-center">
              {movimiento.estadoInicial.nombreEstado}
            </span>
            <ArrowRight size={20} className="text-[var(--text-secondary)] flex-shrink-0" />
            <span className="px-3 py-1 rounded-full bg-[var(--success)]/20 text-[var(--success)] text-xs font-semibold text-center">
              {movimiento.estadoFinal.nombreEstado}
            </span>
          </div>
        </div>

        {/* Fletero */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-sm text-[var(--text-secondary)]">Fletero</span>
          <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]" title={movimiento.pedido.fletero?.dsFletero}>
            {movimiento.pedido.fletero?.dsFletero || 'N/A'}
          </span>
        </div>

        {/* Usuario */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-sm text-[var(--text-secondary)]">Usuario</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {movimiento.usuario.nombre} {movimiento.usuario.apellido}
          </span>
        </div>
      </div>
    </Card>
  );
};
