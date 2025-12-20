import React from 'react';
import { Wrench } from 'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import logo from '../../assets/logo.png';

export const WorkingOnItPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative">
      <LogoutButton />
      
      <div className="text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={logo} 
            alt="La Montevideana System" 
            className="w-48 h-48 object-contain animate-pulse-slow"
          />
        </div>

        {/* Icon with animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Wrench className="w-20 h-20 text-primary animate-bounce" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-100 mb-4 animate-slide-up">
          Estamos trabajando en esta área
        </h1>
        
        <p className="text-xl text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Pronto estará disponible
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
