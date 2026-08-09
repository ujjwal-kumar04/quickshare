import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setProfile(data.data);
      setName(data.data.user.name);
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/profile', { name });
      updateUser(data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await api.put('/profile/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Profile</h1>

      <div className="neu-card rounded-neu p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="neu-flat flex h-16 w-16 items-center justify-center rounded-full text-2xl text-accent-500">
            <FiUser />
          </div>
          <div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">{user?.email}</p>
            <p className="text-xs text-slate-400">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {!profile ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="neu-flat rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-slate-700 dark:text-slate-100">{profile.totalShares}</p>
              <p className="text-xs text-slate-400">Total Shares</p>
            </div>
            <div className="neu-flat rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-slate-700 dark:text-slate-100">{profile.totalDownloads}</p>
              <p className="text-xs text-slate-400">Total Downloads</p>
            </div>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" loading={savingProfile} className="w-fit">Save Changes</Button>
        </form>
      </div>

      <div className="neu-card rounded-neu p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Change Password</h2>
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          <Input label="Current password" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <Input label="New password" type="password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <Input label="Confirm new password" type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button type="submit" loading={savingPw} className="w-fit">Change Password</Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
