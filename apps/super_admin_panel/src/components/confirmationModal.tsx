// ConfirmationModal.tsx (reusable component)
import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  type?: 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onClose,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationModalProps) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus management
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmBtn: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
          bgColor: 'from-red-50 to-red-100'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white',
          bgColor: 'from-amber-50 to-orange-100'
        };
      default:
        return {
          icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          confirmBtn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
          bgColor: 'from-blue-50 to-indigo-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all duration-300 scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${styles.bgColor} rounded-t-2xl p-6 text-center`}>
          <div className="flex justify-center mb-4" id="modal-title">
            {styles.icon}
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-50 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p 
            id="modal-description"
            className="text-gray-800 text-lg font-medium leading-relaxed whitespace-pre-line"
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-6 rounded-xl ${styles.confirmBtn} font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 