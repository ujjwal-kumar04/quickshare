import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShare2, FiEye, FiDownload, FiHardDrive, FiPlus } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import StatsCard from '../../components/common/StatsCard';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/activity')]);
      setStats(s.data.data);
      setActivity(a.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Hi, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-400">Here's what's happening with your shares.</p>
        </div>
        <Link to="/dashboard/create"><Button><FiPlus className="mr-1 inline" /> Create Share</Button></Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <StatsCard icon={FiShare2} label="Total Shares" value={stats.totalShares} accent />
            <StatsCard icon={FiShare2} label="Active Shares" value={stats.activeShares} />
            <StatsCard icon={FiEye} label="Total Views" value={stats.totalViews} />
            <StatsCard icon={FiDownload} label="Total Downloads" value={stats.totalDownloads} />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {!loading && stats && (
          <>
            <StatsCard icon={FiShare2} label="Expired Shares" value={stats.expiredShares} />
            <StatsCard icon={FiHardDrive} label="Storage Used" value={formatSize(stats.storageUsedBytes)} />
          </>
        )}
      </div>

      <div className="neu-card rounded-neu p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Recent Activity</h2>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : !activity?.recentShares?.length ? (
          <EmptyState title="You haven't created any shares yet." subtitle="Your recent activity will appear here." />
        ) : (
          <div className="flex flex-col gap-2">
            {activity.recentShares.map((s) => (
              <div key={s._id} className="neu-flat flex items-center justify-between rounded-2xl p-3 text-sm">
                <span className="font-medium text-accent-500">{s.shareKey}</span>
                <span className="text-slate-400">{new Date(s.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
