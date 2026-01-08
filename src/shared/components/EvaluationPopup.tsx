import React, { useState } from 'react';
import { 
  RATING_VALUES, 
  RATING_LABELS, 
  RATING_COLORS, 
  RATING_FACES 
} from '../../modules/pedidos/pedido.types';

interface EvaluationPopupProps {
  isOpen: boolean;
  onSubmit: (rating: number) => Promise<void>;
  orderIdPedido: string;
  isLoading?: boolean;
}

export const EvaluationPopup: React.FC<EvaluationPopupProps> = ({ 
  isOpen, 
  onSubmit,
  orderIdPedido,
  isLoading = false
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRating === null || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating);
      // Reset selection after successful submit
      setSelectedRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratings = [
    RATING_VALUES.TERRIBLE,
    RATING_VALUES.REGULAR,
    RATING_VALUES.BIEN,
    RATING_VALUES.MUY_BIEN,
    RATING_VALUES.SIN_ERRORES,
  ];

  const loading = isLoading || isSubmitting;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    >
      <div 
        className="rounded-xl p-8 w-full max-w-4xl relative shadow-2xl"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Evaluar Armado del Pedido
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Pedido: <span style={{ color: 'var(--accent)' }}>{orderIdPedido}</span>
          </p>
          <p 
            className="text-sm mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Seleccione la calificación del armado del pedido
          </p>
        </div>

        {/* Rating Faces */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {ratings.map((rating) => {
            const isSelected = selectedRating === rating;
            const faceColor = isSelected ? RATING_COLORS[rating] : '#9ca3af'; // Gray when not selected
            
            return (
              <button
                key={rating}
                onClick={() => !loading && setSelectedRating(rating)}
                disabled={loading}
                className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: isSelected ? `${faceColor}15` : 'transparent',
                  border: isSelected ? `2px solid ${faceColor}` : '2px solid transparent',
                }}
              >
                {/* Face Emoji */}
                <div 
                  className="text-5xl transition-all"
                  style={{ 
                    filter: isSelected ? 'none' : 'grayscale(100%)',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                >
                  {RATING_FACES[rating]}
                </div>
                
                {/* Label */}
                <span 
                  className="text-sm font-medium"
                  style={{ 
                    color: isSelected ? faceColor : 'var(--text-secondary)',
                  }}
                >
                  {RATING_LABELS[rating]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confirm Button - Only visible when rating is selected */}
        {selectedRating !== null && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 min-w-[200px]"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)',
              }}
            >
              {loading ? 'Procesando...' : 'Confirmar Evaluación'}
            </button>
          </div>
        )}

        {/* Helper text when no selection */}
        {selectedRating === null && (
          <p 
            className="text-center text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Seleccione una opción para continuar
          </p>
        )}
      </div>
    </div>
  );
};
