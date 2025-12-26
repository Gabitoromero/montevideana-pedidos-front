import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Sidebar } from '../../shared/components/Sidebar';
import { useAuthStore } from '../../store/auth.store';

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

export const UserManagementHub: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const menuCards = [
    {
      title: 'Usuarios del Sistema',
      description: 'Ver y gestionar usuarios del sistema',
      icon: <Users size={48} />,
      path: '/users/list'
    },
    {
      title: 'Crear Usuario',
      description: 'Dar de alta un nuevo usuario',
      icon: <UserPlus size={48} />,
      path: '/users/create'
    },
    {
      title: 'Editar Mi Perfil',
      description: 'Modificar mi información personal',
      icon: <UserCircle size={48} />,
      path: `/users/edit/${currentUser?.id}`
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <Sidebar />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </button>

          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-[var(--text-secondary)]">
            Administra los usuarios del sistema
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
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
