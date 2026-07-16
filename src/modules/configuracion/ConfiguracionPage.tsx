import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, AlertCircle, CheckCircle, Clock, Save } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { configuracionService, type ConfiguracionDTO } from './configuracion.service';
import { configuracionSchema } from './configuracion.schema';

export const ConfiguracionPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ConfiguracionDTO>({
    horaConsultaPreventaManana: '13:00',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const data = await configuracionService.getConfiguracion();
        setFormData({
          horaConsultaPreventaManana: data.horaConsultaPreventaManana || '13:00',
        });
      } catch (error) {
        console.error('Error fetching configuracion:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldSchema = configuracionSchema.pick({ [name]: true } as Record<keyof ConfiguracionDTO, true>);
    const result = fieldSchema.safeParse({ [name]: value });
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [name]: result.error.issues[0]?.message }));
    }
  };

  const validateForm = (): boolean => {
    const result = configuracionSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await configuracionService.updateConfiguracion(formData);
      setSubmitStatus({
        type: 'success',
        message: 'Configuración actualizada exitosamente'
      });
    } catch (error: unknown) {
      const errorResponse = (error as { response?: { data?: { message?: string } } })?.response;
      setSubmitStatus({
        type: 'error',
        message: errorResponse?.data?.message || 'Error al actualizar configuración'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[var(--bg-primary)]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden selection:bg-[var(--primary)] selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col relative">
        <FullscreenButton />

        <div className="flex-1 p-8 lg:px-12 overflow-y-auto w-full max-w-5xl mx-auto custom-scrollbar">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-6"
            >
              <div className="bg-[var(--bg-secondary)] p-2 rounded-lg group-hover:bg-[var(--primary)] group-hover:text-white transition-all mr-3 shadow-md">
                <ArrowLeft size={20} />
              </div>
              <span className="font-semibold">Volver al inicio</span>
            </button>
            
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
              Configuración del Sistema
            </h1>
            <p className="text-[var(--text-secondary)]">
              Gestionar variables globales y parámetros
            </p>
          </div>

          <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
              <Settings size={28} className="text-[var(--primary)]" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Parámetros Globales</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              <div className="space-y-1.5">
                <label htmlFor="horaConsultaPreventaManana" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                  Hora de consulta (Preventa Mañana) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                  <input
                    type="time"
                    id="horaConsultaPreventaManana"
                    name="horaConsultaPreventaManana"
                    value={formData.horaConsultaPreventaManana}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                      errors.horaConsultaPreventaManana ? 'border-[var(--error)]' : 'border-[var(--border)]'
                    } text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                  />
                </div>
                {errors.horaConsultaPreventaManana && (
                  <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.horaConsultaPreventaManana}
                  </p>
                )}
              </div>

              </div>

              {submitStatus && (
                <div
                  className={`p-4 mb-4 rounded-lg flex items-center gap-3 ${
                    submitStatus.type === 'success'
                      ? 'bg-[var(--success)]/10 border-2 border-[var(--success)]'
                      : 'bg-[var(--error)]/10 border-2 border-[var(--error)]'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle size={24} className="text-[var(--success)]" />
                  ) : (
                    <AlertCircle size={24} className="text-[var(--error)]" />
                  )}
                  <p
                    className={`font-medium ${
                      submitStatus.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                    }`}
                  >
                    {submitStatus.message}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-bold rounded-lg shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                  {!isSubmitting && <Save size={20} />}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
