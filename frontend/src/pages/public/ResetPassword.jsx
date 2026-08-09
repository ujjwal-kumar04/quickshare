import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="neu-card rounded-neu p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-700 dark:text-slate-100">Reset password</h1>
        <p className="mb-6 text-sm text-slate-400">Choose a new password for your account.</p>

        {!token ? (
          <p className="neu-inset rounded-2xl p-4 text-sm text-danger">
            Invalid or missing reset token. <Link to="/forgot-password" className="underline">Request a new link</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm new password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
