import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', loading }) => (
  <Modal open={open} onClose={onClose} title={title}>
    {description && <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
    </div>
  </Modal>
);

export default ConfirmModal;
