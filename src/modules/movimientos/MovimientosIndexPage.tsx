import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ListFilter, FileText, ArrowLeft, Download, XCircle } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { canViewCancelledOrders } from '../../shared/config/permissions';
import { useAuthStore } from '../../store/auth.store';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

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
      className="w-full max-w-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border)] hover:border-[var(--primary)] group"
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

export const MovimientosIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const userSector = user?.sector;
  const { getBackRoute } = useBackNavigation();

  const menuCards = [
    {
      title: 'Buscar por Usuario',
      description: 'Consultar movimientos de un usuario específico',
      icon: <User size={48} />,
      path: '/movimientos/usuario',
    },
    {
      title: 'Buscar por Estado',
      description: 'Consultar movimientos por estado de pedido',
      icon: <ListFilter size={48} />,
      path: '/movimientos/estado',
    },
    {
      title: 'Historial de Pedido',
      description: 'Ver todos los movimientos de un pedido',
      icon: <FileText size={48} />,
      path: '/movimientos/historial',
    },
    {
      title: 'Exportar Movimientos',
      description: 'Descargar movimientos en formato CSV',
      icon: <Download size={48} />,
      path: '/movimientos/export',
    },
  ];

  // Add cancelled orders card only for ADMIN, CHESS, EXPEDICION
  if (canViewCancelledOrders(userSector)) {
    menuCards.push({
      title: 'Pedidos Anulados',
      description: 'Ver listado de pedidos anulados',
      icon: <XCircle size={48} />,
      path: '/movimientos/anulados',
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <FullscreenButton />
      <Sidebar />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(getBackRoute())}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Consulta de Movimientos
          </h1>
          <p className="text-[var(--text-secondary)]">
            Selecciona el tipo de consulta que deseas realizar
          </p>
        </div>

        {/* Menu Cards */}
        <div className="flex flex-wrap justify-center gap-8 animate-slide-up">
          {menuCards.map((card) => (
            <MenuCard
              key={card.path}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
