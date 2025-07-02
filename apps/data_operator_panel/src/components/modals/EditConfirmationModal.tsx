import { ConfirmationModal } from './ConfirmationModal';

interface EditModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  itemName?: string;
}

export const EditConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
  itemName = "this item",
}: EditModalProps) => (
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
