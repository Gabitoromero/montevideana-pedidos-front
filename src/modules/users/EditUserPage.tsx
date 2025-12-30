import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserX, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { userService, type UpdateUsuarioDTO } from './user.service';
import { useAuthStore } from '../../store/auth.store';

interface FormData {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'admin' | 'armado' | 'facturacion' | 'CHESS' | '';
  password: string;
  activo: boolean;
}

interface FormErrors {
  username?: string;
  nombre?: string;
  apellido?: string;
  sector?: string;
  password?: string;
}

export const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    nombre: '',
    apellido: '',
    sector: '',
    password: '',
    activo: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const isCurrentUser = currentUser?.id === Number(id);
  const isChessUser = formData.sector === 'CHESS';

  useEffect(() => {
    if (id) {
      loadUser(Number(id));
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);
      setFormData({
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        sector: user.sector,
        password: '',
        activo: user.activo,
      });
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al cargar usuario',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'username':
      case 'nombre':
      case 'apellido':
        if (value.length < 4) {
          return `Debe tener al menos 4 caracteres`;
        }
        break;
      case 'sector':
        if (!value) {
          return 'Debe seleccionar un sector';
        }
        break;
      case 'password':
        // Password is optional for editing
        if (value && value.length < 4) {
          return 'La contraseña debe tener al menos 4 caracteres';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing (only for fields that have errors)
    if (name !== 'activo' && name in errors && errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
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
    const newErrors: FormErrors = {};
    
    (['username', 'nombre', 'apellido', 'sector'] as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key] as string);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    // Validate password only if it's being changed
    if (formData.password) {
      const passwordError = validateField('password', formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const updateData: UpdateUsuarioDTO = {
        username: formData.username,
        nombre: formData.nombre,
        apellido: formData.apellido,
        sector: formData.sector as 'admin' | 'armado' | 'facturacion',
        activo: formData.activo,
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.updateUser(Number(id), updateData);

      setSubmitStatus({
        type: 'success',
        message: `Usuario "${formData.username}" actualizado exitosamente`,
      });

      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar el usuario',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const message = await userService.cambiarEstadoUser(Number(id));
      
      setSubmitStatus({
        type: 'success',
        message: message,
      });

      // Toggle the local state
      setFormData(prev => ({ ...prev, activo: !prev.activo }));
      setShowDeactivateConfirm(false);
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al cambiar el estado del usuario',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/users/list')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a la lista</span>
          </button>
          
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Editar Usuario
          </h1>
          {isCurrentUser && (
            <p className="text-[var(--accent)] font-semibold">
              ✨ Estás editando tu propio perfil
            </p>
          )}
          {isChessUser && (
            <div className="mb-4 p-4 bg-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-lg">
              <p className="text-[var(--accent)] font-semibold">
                ⚠️ Este es un usuario del sistema y no puede ser editado
              </p>
            </div>
          )}
          <p className="text-[var(--text-secondary)]">
            Modificar información del usuario
          </p>
        </div>

        {/* Form Card */}
        <Card padding="lg" className="bg-[var(--bg-secondary)] border-2 border-[var(--border)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isChessUser}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                  errors.username ? 'border-[var(--error)]' : 'border-[var(--border)]'
                } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Ingrese nombre de usuario"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isChessUser}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                  errors.nombre ? 'border-[var(--error)]' : 'border-[var(--border)]'
                } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Ingrese nombre"
              />
              {errors.nombre && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isChessUser}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                  errors.apellido ? 'border-[var(--error)]' : 'border-[var(--border)]'
                } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Ingrese apellido"
              />
              {errors.apellido && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.apellido}
                </p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Sector *
              </label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isCurrentUser || isChessUser}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                  errors.sector ? 'border-[var(--error)]' : 'border-[var(--border)]'
                } text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  isCurrentUser || isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Seleccione un sector</option>
                <option value="admin">Admin</option>
                <option value="armado">Armado</option>
                <option value="facturacion">Facturación</option>
                {formData.sector === 'CHESS' && <option value="CHESS">CHESS</option>}
              </select>
              {errors.sector && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.sector}
                </p>
              )}
              {isCurrentUser && (
                <p className="mt-2 text-sm text-[var(--accent)] flex items-center gap-1">
                  ⚠️ No puedes cambiar tu propio sector
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Contraseña (dejar en blanco para no cambiar)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isChessUser}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                  errors.password ? 'border-[var(--error)]' : 'border-[var(--border)]'
                } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="Nueva contraseña (opcional)"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Estado Activo - Read Only */}
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-lighter)] rounded-lg border border-[var(--border)]">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                disabled={true}
                className="w-5 h-5 text-[var(--primary)] bg-[var(--bg-secondary)] border-[var(--border)] rounded focus:ring-[var(--primary)] opacity-50 cursor-not-allowed"
              />
              <label htmlFor="activo" className="text-[var(--text-primary)] font-medium">
                Usuario {formData.activo ? 'Activo' : 'Inactivo'}
              </label>
              <span className="text-sm text-[var(--text-secondary)] ml-auto">
                Solo lectura
              </span>
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

            {/* Action Buttons */}
            {!isChessUser && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>

                {!isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => setShowDeactivateConfirm(true)}
                    disabled={isSubmitting}
                    className={`px-6 py-4 font-bold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 ${
                      formData.activo
                        ? 'bg-[var(--error)] hover:bg-red-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <UserX size={20} />
                    {formData.activo ? 'Dar de Baja' : 'Dar de Alta'}
                  </button>
                )}
              </div>
            )}


          </form>
        </Card>

        {/* Toggle Status Confirmation Modal */}
        {showDeactivateConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card padding="lg" className={`max-w-md bg-[var(--bg-secondary)] border-2 ${
              formData.activo ? 'border-[var(--error)]' : 'border-green-600'
            }`}>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                {formData.activo ? 'Confirmar Baja de Usuario' : 'Confirmar Alta de Usuario'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {formData.activo ? (
                  <>
                    ¿Estás seguro de que deseas dar de baja al usuario <strong className="text-[var(--text-primary)]">{formData.username}</strong>?
                    Esta acción marcará al usuario como inactivo.
                  </>
                ) : (
                  <>
                    ¿Estás seguro de que deseas dar de alta al usuario <strong className="text-[var(--text-primary)]">{formData.username}</strong>?
                    Esta acción marcará al usuario como activo.
                  </>
                )}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="flex-1 py-3 px-6 bg-[var(--bg-lighter)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-6 font-bold rounded-lg transition-colors disabled:opacity-50 text-white ${
                    formData.activo
                      ? 'bg-[var(--error)] hover:bg-red-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Procesando...' : (formData.activo ? 'Confirmar Baja' : 'Confirmar Alta')}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
