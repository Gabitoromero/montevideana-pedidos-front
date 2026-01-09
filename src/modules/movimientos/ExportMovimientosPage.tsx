import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { movimientoService } from './movimiento.service';

export const ExportMovimientosPage: React.FC = () => {
  const navigate = useNavigate();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check if date range exceeds 6 months
  const isRangeExceeding6Months = (): boolean => {
    if (!fechaDesde || !fechaHasta) {
      return false;
    }

    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    
    const sixMonthsLater = new Date(desde);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    return hasta > sixMonthsLater;
  };

  // Validate date range
  const validateDates = (): string | null => {
    if (!fechaDesde) {
      return 'Debe seleccionar una fecha de inicio';
    }
    if (!fechaHasta) {
      return 'Debe seleccionar una fecha de fin';
    }

    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    const todayDate = new Date(today);

    // Check if dates are in the future
    if (desde > todayDate) {
      return 'La fecha de inicio no puede ser futura';
    }
    if (hasta > todayDate) {
      return 'La fecha de fin no puede ser futura';
    }

    // Check if fechaHasta >= fechaDesde
    if (hasta < desde) {
      return 'La fecha de fin debe ser posterior o igual a la fecha de inicio';
    }

    // Check if range is <= 6 months
    const sixMonthsLater = new Date(desde);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    if (hasta > sixMonthsLater) {
      return 'El rango máximo permitido es de 6 meses';
    }

    return null;
  };

  const handleExport = async () => {
    const validationError = validateDates();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await movimientoService.exportMovimientos(fechaDesde, fechaHasta);
      // Success - file downloaded automatically
    } catch (err: any) {
      console.error('Error al exportar movimientos:', err);
      setError(err.response?.data?.message || 'Error al exportar movimientos. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/movimientos')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a Movimientos</span>
          </button>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Exportar Movimientos
          </h1>
          <p className="text-[var(--text-secondary)]">
            Descarga movimientos en formato CSV seleccionando un rango de fechas
          </p>
        </div>

        {/* Form Card */}
        <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
          <div className="space-y-6">
            {/* Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Fecha Desde <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setError(null);
                  }}
                  max={today}
                  className="w-full px-4 py-3 bg-[var(--bg-lighter)] border-2 border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Fecha Hasta <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setError(null);
                  }}
                  max={today}
                  className="w-full px-4 py-3 bg-[var(--bg-lighter)] border-2 border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* Info Box - Only shown when range exceeds 6 months */}
            {isRangeExceeding6Months() && (
              <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg">
                <p className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Nota:</strong> El rango máximo permitido es de 6 meses. 
                  No se pueden seleccionar fechas futuras.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[var(--error)]/10 border-2 border-[var(--error)] rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
                <p className="text-[var(--error)] text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full py-4 text-lg font-bold"
              size="lg"
            >
              <Download size={24} />
              {isLoading ? 'Descargando...' : 'Descargar CSV'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
