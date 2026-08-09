import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PasswordModal = ({ open, onSubmit, loading, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <Modal open={open} onClose={() => {}} title="Password protected share">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This share is protected. Enter the password to view its contents.
        </p>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoFocus
        />
        <Button type="submit" loading={loading} className="w-full">Unlock</Button>
      </form>
    </Modal>
  );
};

export default PasswordModal;
