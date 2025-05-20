// Reusable confirmation modal component
interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onClose,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-black/30 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <p className="text-gray-700 text-center mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#167F92] text-white rounded hover:bg-[#12687A] transition-colors"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
