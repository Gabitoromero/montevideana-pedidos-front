import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ResultNotificationProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export const ResultNotification: React.FC<ResultNotificationProps> = ({
  isOpen,
  isSuccess,
  message,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className="rounded-lg p-6 shadow-2xl max-w-md w-full mx-4 pointer-events-auto"
        style={{
          backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {isSuccess ? (
              <CheckCircle size={24} className="text-white" />
            ) : (
              <XCircle size={24} className="text-white" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              {isSuccess ? '¡Éxito!' : 'Error'}
            </h3>
            <p className="text-white text-sm opacity-90">
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
