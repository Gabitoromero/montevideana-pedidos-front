import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn } from 'lucide-react';
import { authService } from './auth.service';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import logo from '../../assets/logo.png';

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
      // Si no explota, es que fue exitoso. Redirigimos al Home.
      navigate('/');
    } catch (err: any) {
      console.error(err);
      // Manejo básico de errores
      setError('Credenciales incorrectas o error de conexión');
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
            src={logo} 
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
              placeholder="Ej: gabi.dev"
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