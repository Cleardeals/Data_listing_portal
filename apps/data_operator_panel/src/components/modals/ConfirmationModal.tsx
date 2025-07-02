// Reusable confirmation modal component
interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onClose,
  confirmText = "Yes",
  cancelText = "No",
  variant = "warning",
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '🗑️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
          focusRing: 'focus:ring-red-500'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
          focusRing: 'focus:ring-yellow-500'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          focusRing: 'focus:ring-blue-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <span className={`text-2xl ${styles.iconColor}`}>{styles.icon}</span>
            </div>
          </div>
          
          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirm Action</h3>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-slate-500 transition-all duration-200 font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 ${styles.confirmBg} text-white rounded-lg ${styles.focusRing} focus:ring-2 transition-all duration-200 font-medium shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
