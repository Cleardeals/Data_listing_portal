// ConfirmationModal.tsx (reusable component)
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full relative flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black font-bold z-10">&times;</button>
        <p className="text-gray-800 text-center mb-8 text-lg whitespace-pre-line font-medium mt-2">
          {message}
        </p>
        <div className="flex justify-center space-x-6 w-full mt-2">
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-blue-700 text-white text-xl font-extrabold rounded shadow-lg border-2 border-blue-800 hover:bg-blue-800 transition-colors"
          >
            YES
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white text-gray-800 text-xl font-bold rounded shadow-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}; 