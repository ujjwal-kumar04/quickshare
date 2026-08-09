import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="neu-card rounded-neu p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-700 dark:text-slate-100">Forgot password</h1>
        <p className="mb-6 text-sm text-slate-400">We'll email you a reset link if the account exists.</p>

        {sent ? (
          <p className="neu-inset rounded-2xl p-4 text-sm text-slate-500 dark:text-slate-400">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-accent-500 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
