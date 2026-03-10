import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, User, Briefcase, Lock, ArrowRight, IdCard } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { userService, type CreateUsuarioDTO } from './user.service';
import { createUserSchema } from './user.schema';

interface FormData {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'TELEVISOR' | '';
  password: string;
}

interface FormErrors {
  username?: string;
  nombre?: string;
  apellido?: string;
  sector?: string;
  password?: string;
}

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    nombre: '',
    apellido: '',
    sector: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    // Pick solo el campo respectivo para validación individual
    const fieldSchema = createUserSchema.pick({ [name]: true } as any);
    const result = fieldSchema.safeParse({ [name]: value });
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormData, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof FormErrors] = err.message;
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
      const userData: CreateUsuarioDTO = {
        username: formData.username,
        nombre: formData.nombre,
        apellido: formData.apellido,
        sector: formData.sector as 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'TELEVISOR',
        password: formData.password,
      };

      await userService.createUser(userData);

      setSubmitStatus({
        type: 'success',
        message: `Usuario "${formData.username}" creado exitosamente`,
      });

      // Reset form
      setFormData({
        username: '',
        nombre: '',
        apellido: '',
        sector: '',
        password: '',
      });
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al crear el usuario. Intente nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <FullscreenButton />
      <Sidebar />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a Gestión de Usuarios</span>
          </button>
          
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Crear Nuevo Usuario
          </h1>
          <p className="text-[var(--text-secondary)]">
            Dar de alta un nuevo usuario en el sistema
          </p>
        </div>

        {/* Form Card */}
        <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
            <UserPlus size={28} className="text-[var(--primary)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Crear Nuevo Usuario</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Nombre de Usuario *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.username ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                  placeholder="JaneDoe"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Nombre *
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.nombre ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                  placeholder="Jane"
                />
              </div>
              {errors.nombre && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-1.5">
              <label htmlFor="apellido" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Apellido *
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.apellido ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                  placeholder="Doe"
                />
              </div>
              {errors.apellido && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.apellido}
                </p>
              )}
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <label htmlFor="sector" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Sector *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.sector ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none`}
                >
                  <option value="">Seleccione un sector</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CAMARA">Cámara</option>
                  <option value="EXPEDICION">Expedición</option>
                  <option value="TELEVISOR">Televisor</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.sector && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.sector}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.password ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.password}
                </p>
              )}
            </div>
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-bold rounded-lg shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Creando usuario...' : 'Crear Usuario'}</span>
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
