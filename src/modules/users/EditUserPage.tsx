import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserX, AlertCircle, CheckCircle, Loader2, MoreVertical, Trash2, User, IdCard, Briefcase, Lock } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { userService, type UpdateUsuarioDTO } from './user.service';
import { useAuthStore } from '../../store/auth.store';
import { editUserSchema } from './user.schema';

interface FormData {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'CHESS' | 'TELEVISOR' | '';
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
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (name === 'activo') return undefined; // No validamos el boolean activo aquí
    // Pick solo el campo respectivo para validación individual
    const fieldSchema = editUserSchema.pick({ [name]: true } as any);
    const result = fieldSchema.safeParse({ [name]: value });
    if (!result.success) {
      return result.error.issues[0]?.message;
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
    // Create a payload for validation mapping formData structure
    const validationPayload = {
      username: formData.username,
      nombre: formData.nombre,
      apellido: formData.apellido,
      sector: formData.sector,
      password: formData.password || ''
    };
    
    const result = editUserSchema.safeParse(validationPayload);
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
      const updateData: UpdateUsuarioDTO = {
        username: formData.username,
        nombre: formData.nombre,
        apellido: formData.apellido,
        sector: formData.sector as 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'TELEVISOR',
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

  const handleDeleteUser = async () => {
    if (!id) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await userService.deleteUser(Number(id));
      
      setSubmitStatus({
        type: 'success',
        message: 'Usuario eliminado definitivamente',
      });

      setShowDeleteConfirm(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/users/list');
      }, 2000);
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.mensaje || error.response?.data?.message || 'Error al eliminar el usuario',
      });
      setShowDeleteConfirm(false);
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
      <FullscreenButton />
      <Sidebar />
      
      <div className="max-w-4xl mx-auto relative">
        {/* Three-dot menu button (top right) */}
        {!isChessUser && !isCurrentUser && (
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-[var(--bg-secondary)]"
            >
              <MoreVertical size={24} />
            </button>
            
            {/* Dropdown menu */}
            {showOptionsMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowOptionsMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute top-12 right-0 z-20 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-lg shadow-lg p-2 min-w-[200px]">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowOptionsMenu(false);
                    }}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-2 justify-center font-semibold disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Eliminar Definitivamente
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
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
                  disabled={isChessUser}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.username ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                    isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                  disabled={isChessUser}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.nombre ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                    isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                  disabled={isChessUser}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.apellido ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                    isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                  disabled={isCurrentUser || isChessUser}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.sector ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none ${
                    isCurrentUser || isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Seleccione un sector</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CAMARA">Cámara</option>
                  <option value="EXPEDICION">Expedición</option>
                  <option value="TELEVISOR">Televisor</option>
                  {formData.sector === 'CHESS' && <option value="CHESS">CHESS</option>}
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
              {isCurrentUser && (
                <p className="mt-2 text-sm text-[var(--accent)] flex items-center gap-1">
                  ⚠️ No puedes cambiar tu propio sector
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] ml-1">
                Contraseña (dejar en blanco para no cambiar)
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
                  disabled={isChessUser}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--bg-lighter)] border-2 ${
                    errors.password ? 'border-[var(--error)]' : 'border-[var(--border)]'
                  } text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                    isChessUser ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder=" Nueva contraseña (opcional)"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Estado Activo - Read Only */}
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 p-4 bg-[var(--bg-lighter)] rounded-lg border border-[var(--border)] h-[52px]">
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

            {/* Action Buttons */}
            {!isChessUser && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 px-6 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-bold rounded-lg shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>

                {!isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => setShowDeactivateConfirm(true)}
                    disabled={isSubmitting}
                    className={`px-6 py-4 font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      formData.activo
                        ? 'bg-[var(--error)] hover:bg-red-600 shadow-red-600/20 text-white'
                        : 'bg-green-600 hover:bg-green-700 shadow-green-600/20 text-white'
                    }`}
                  >
                    <UserX size={20} />
                    <span>{formData.activo ? 'Dar de Baja' : 'Dar de Alta'}</span>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card padding="lg" className="max-w-md bg-[var(--bg-secondary)] border-2 border-red-900">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                ⚠️ Eliminar Usuario Definitivamente
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                ¿Estás seguro de que deseas eliminar DEFINITIVAMENTE al usuario{' '}
                <strong className="text-[var(--text-primary)]">{formData.username}</strong>? Se eliminarán todos sus movimientos con él.
                <br /><br />
                <span className="text-[var(--error)] font-semibold">
                  Esta acción NO se puede deshacer.
                </span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-[var(--bg-lighter)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Eliminar Definitivamente
                    </>
                  )}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
