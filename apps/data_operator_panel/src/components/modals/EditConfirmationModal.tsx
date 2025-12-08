import { ConfirmationModal } from './ConfirmationModal';
import { JSX } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  itemName?: string;
}

export function EditConfirmationModal({
  isOpen,
  onConfirm,
  onClose,
  itemName = "this item",
}: EditModalProps): JSX.Element | null {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      message={`Are you sure you want to edit ${itemName}?\n\nYour changes will be saved immediately.`}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmText="Edit"
      cancelText="Cancel"
      variant="info"
    />
  );
}
