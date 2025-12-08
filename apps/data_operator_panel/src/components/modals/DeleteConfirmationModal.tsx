import { ConfirmationModal } from './ConfirmationModal';
import { JSX } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  itemName?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onClose,
  itemName = "this item",
}: DeleteModalProps): JSX.Element | null {
  return (
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
}
