import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListOrdered, Package, DollarSign } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { useAuthStore } from '../../store/auth.store';
import { getAccessibleRoutes } from '../../shared/config/permissions';
import { getDefaultRouteForSector } from '../../shared/config/routes';
import logo from '../../assets/logo.png';

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <Card
      padding="lg"
      className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border)] hover:border-[var(--primary)] group"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
          <div className="text-[var(--primary)] group-hover:text-[var(--primary-light)] transition-colors">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
          <p className="text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Redirigir automáticamente a usuarios no-admin/CHESS a su página específica
  useEffect(() => {
    if (user && user.sector !== 'admin' && user.sector !== 'CHESS') {
      const redirectPath = getDefaultRouteForSector(user.sector);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  // Obtener rutas accesibles según el sector del usuario
  const accessibleRoutes = user ? getAccessibleRoutes(user.sector) : [];

  // Debug: Log para verificar datos
  console.log('HomePage - User:', user);
  console.log('HomePage - Accessible Routes:', accessibleRoutes);

  // Definir todas las tarjetas posibles con sus iconos
  const allMenuCards = [
    {
      path: '/orders',
      title: 'Pedidos',
      description: 'Gestión de pedidos de clientes',
      icon: <ListOrdered size={48} />
    },
    {
      path: '/assembly',
      title: 'Armado de Pedidos',
      description: 'Preparación y armado de pedidos',
      icon: <Package size={48} />
    },
    {
      path: '/billing',
      title: 'Facturación',
      description: 'Gestión de facturas y pagos',
      icon: <DollarSign size={48} />
    },
  ];

  // Filtrar solo las tarjetas a las que el usuario tiene acceso
  const visibleCards = allMenuCards.filter(card =>
    accessibleRoutes.some(route => route.path === card.path)
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 relative">
      <Sidebar />

      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-12 animate-fade-in">
          <img 
            src={logo} 
            alt="La Montevideana System" 
            className="w-64 h-64 object-contain mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Bienvenido, {user?.nombre} {user?.apellido}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            Sector: <span className="text-[var(--primary)] font-semibold">{user?.sector}</span>
          </p>
          <p className="text-md text-[var(--text-secondary)] mt-2">
            Selecciona un módulo para comenzar
          </p>
        </div>

        {/* Menu Cards - Solo las permitidas */}
        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            {visibleCards.map(card => (
              <MenuCard
                key={card.path}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-[var(--text-secondary)] text-lg">
              No tienes acceso a ningún módulo.
              <br />
              Contacta al administrador para obtener permisos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

