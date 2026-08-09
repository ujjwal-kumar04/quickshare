import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Registered! Your account needs admin approval before you can log in.');
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
        <h1 className="mb-1 text-2xl font-bold text-slate-700 dark:text-slate-100">Create your account</h1>
        <p className="mb-6 text-sm text-slate-400">
          New accounts require admin approval before you can log in.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Confirm password" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          <Button type="submit" loading={loading} className="w-full">Register</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-accent-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
