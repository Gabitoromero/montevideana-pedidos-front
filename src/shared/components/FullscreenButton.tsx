import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';

export const FullscreenButton: React.FC = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-50 p-3 rounded-lg transition-all duration-200 hover:scale-110"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '2px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
    >
      {isFullscreen ? (
        <Minimize size={24} style={{ color: 'var(--primary)' }} />
      ) : (
        <Maximize size={24} style={{ color: 'var(--primary)' }} />
      )}
    </button>
  );
};
