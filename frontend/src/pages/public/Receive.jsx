import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiKey } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Receive = () => {
  const [key, setKey] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    navigate(`/share/${key.trim().toUpperCase()}`);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="neu-card rounded-neu p-8 text-center">
        <div className="neu-flat mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-accent-500">
          <FiKey className="h-6 w-6" />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-slate-700 dark:text-slate-100">Receive a Share</h1>
        <p className="mb-6 text-sm text-slate-400">Enter the share key you were given.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="e.g. QS-A8K92X"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="text-center text-lg font-semibold tracking-widest"
            autoFocus
          />
          <Button type="submit" className="w-full">Retrieve Share</Button>
        </form>
      </div>
    </div>
  );
};

export default Receive;
