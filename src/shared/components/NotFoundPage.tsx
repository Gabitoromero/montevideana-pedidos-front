import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import logotest from '../../assets/nuevologo.png';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="text-center animate-fade-in max-w-2xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={logotest} 
            alt="La Montevideana System" 
            className="w-32 h-32 object-contain opacity-50"
          />
        </div>

        {/* 404 with animation */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary mb-4 animate-pulse-slow">
            404
          </h1>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-accent animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          Página no encontrada
        </h2>
        
        <p className="text-lg text-gray-400 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        {/* Button */}
        <Button
          variant="golden"
          size="lg"
          leftIcon={Home}
          onClick={() => navigate('/')}
          className="animate-slide-up"
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
