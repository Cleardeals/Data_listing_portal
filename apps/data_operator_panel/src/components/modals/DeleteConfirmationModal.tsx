import { ConfirmationModal } from './ConfirmationModal';

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  itemName?: string;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
  itemName = "this item",
}: DeleteModalProps) => (
  <ConfirmationModal
    isOpen={isOpen}
    message={`Are you sure you want to delete ${itemName}?\n\nThis action cannot be undone.`}
    onConfirm={onConfirm}
    onClose={onClose}
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
  />
);
