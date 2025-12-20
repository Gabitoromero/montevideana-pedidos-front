import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../modules/auth/auth.service';
import { Button } from './Button';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      leftIcon={LogOut}
      className="fixed top-4 right-4 z-50 bg-dark-lighter/80 backdrop-blur-sm text-primary hover:bg-dark-lighter hover:text-primary-light border border-accent/30"
    >
      Cerrar Sesión
    </Button>
  );
};
