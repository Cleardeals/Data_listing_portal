import { ConfirmationModal } from './ConfirmationModal';

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
}: DeleteModalProps) => (
  <ConfirmationModal
    isOpen={isOpen}
    message="Are You Sure You Want To Delete\nThis Item?"
    onConfirm={onConfirm}
    onClose={onClose}
  />
);
