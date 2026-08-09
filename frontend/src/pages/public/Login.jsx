import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="neu-card rounded-neu p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-700 dark:text-slate-100">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-400">Log in to manage your shares.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-accent-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">Log In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-accent-500 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
