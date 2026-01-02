import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import { authService } from './auth.service';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { getDefaultRouteForSector } from '../../shared/config/routes';
import { useAuthStore } from '../../store/auth.store';
import logotest from '../../assets/logotest.png';
import { logger } from '../../utils/logger';


export const LoginPage = () => {
  const navigate = useNavigate();
  
  // Estado local del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Llamamos a nuestro servicio
      await authService.login(username, password);
      
      // Obtener el usuario actualizado del store
      const currentUser = useAuthStore.getState().user;
      
      // Redirigir según el sector del usuario
      if (currentUser) {
        const redirectPath = getDefaultRouteForSector(currentUser.sector);
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      // 🔍 DEBUG: Log completo del error para ver la estructura
      // console.error('❌ Login Error - Full Error Object:', err);
      // console.error('❌ Login Error - Response:', err.response);
      // console.error('❌ Login Error - Response Data:', err.response?.data);
      // console.error('❌ Login Error - Response Status:', err.response?.status);
      // console.error('❌ Login Error - Response Headers:', err.response?.headers);

      // Manejar diferentes tipos de errores
      if (err.response) {
        // El servidor respondió con un código de error
        const status = err.response.status;
        const data = err.response.data;

        // Rate limit error (429)
        if (status === 429) {
          // express-rate-limit puede enviar el mensaje de diferentes formas
          const rateLimitMessage = 
            data?.message || 
            data?.error || 
            data || 
            'Demasiados intentos de login. Por favor, intenta de nuevo en 15 minutos.';
          
          logger.log('🚫 Rate Limit Message:', rateLimitMessage);
          setError(typeof rateLimitMessage === 'string' ? rateLimitMessage : JSON.stringify(rateLimitMessage));
        } 
        // Credenciales incorrectas (401)
        else if (status === 401) {
          setError(data?.message || 'Credenciales incorrectas');
        }
        // Otros errores del servidor
        else {
          setError(data?.message || 'Error del servidor. Intenta de nuevo.');
        }
      } else if (err.request) {
        // La petición se hizo pero no hubo respuesta
        logger.error('❌ No response received:', err.request);
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        // Algo pasó al configurar la petición
        logger.error('❌ Error setting up request:', err.message);
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Logo Principal */}
        <div className="text-center mb-8">
          <img 
            src={logotest} 
            alt="La Montevideana System" 
            className="w-64 h-64 object-contain mx-auto mb-4 animate-pulse-slow"
          />
        </div>

        {/* Card del Formulario */}
        <div className="bg-dark-lighter rounded-lg shadow-2xl p-8 border-2 border-accent/30">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-100 text-center">Iniciar Sesión</h2>
            <p className="text-sm text-gray-400 mt-2 text-center">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-sm border border-red-500/30 flex items-start gap-2">
                <span className="text-red-500 font-bold">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Usuario"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: pablo"
              icon={User}
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="golden"
              size="lg"
              isLoading={isLoading}
              rightIcon={LogIn}
              className="w-full font-bold"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda? Contacta al administrador
        </p>
      </div>
    </div>
  );
};