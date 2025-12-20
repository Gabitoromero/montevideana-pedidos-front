import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from './Button';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldX size={60} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-100 mb-4">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-400 mb-8 text-lg">
          No tienes permisos para acceder a esta página.
          <br />
          Contacta al administrador si crees que esto es un error.
        </p>
        
        <Button onClick={() => navigate('/')} variant="primary" size="lg">
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
