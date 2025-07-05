import { ConfirmationModal } from './confirmationModal';

interface EditModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const EditConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
}: EditModalProps) => (
  <ConfirmationModal
    isOpen={isOpen}
    message="Are You Sure You Want To Edit\nThis Item?"
    onConfirm={onConfirm}
    onClose={onClose}
    type="warning"
    confirmText="Save Changes"
    cancelText="Cancel"
  />
); 