import React from 'react';
import type { Fletero } from '../../modules/fleteros/fleteros.service';

interface FleterosTableProps {
  fleteros: Fletero[];
  onFleterosClick: (fletero: Fletero) => void;
}

export const FleterosTable: React.FC<FleterosTableProps> = ({ fleteros, onFleterosClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--border)]">
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">ID</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Descripción</th>
            <th className="text-left py-4 px-6 text-[var(--text-primary)] font-bold">Seguimiento</th>
          </tr>
        </thead>
        <tbody>
          {fleteros.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-8 text-[var(--text-secondary)]">
                No se encontraron fleteros
              </td>
            </tr>
          ) : (
            fleteros.map((fletero) => (
              <tr
                key={fletero.idFletero}
                onClick={() => onFleterosClick(fletero)}
                className="border-b border-[var(--border)] hover:bg-[var(--primary)]/10 cursor-pointer transition-colors duration-200"
              >
                <td className="py-4 px-6 text-[var(--text-primary)] font-medium">
                  {fletero.idFletero}
                </td>
                <td className="py-4 px-6 text-[var(--text-primary)]">
                  {fletero.dsFletero}
                </td>
                <td className="py-4 px-6">
                  {fletero.seguimiento ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40">
                      Siguiendo
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500/20 text-gray-500 border border-gray-500/40">
                      No siguiendo
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
