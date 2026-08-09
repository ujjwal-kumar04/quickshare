import { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiClock, FiShare2, FiFile, FiDownload, FiEye, FiHardDrive } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const cards = stats
    ? [
        { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, accent: true },
        { icon: FiUserCheck, label: 'Active Users', value: stats.activeUsers },
        { icon: FiUserX, label: 'Blocked Users', value: stats.blockedUsers },
        { icon: FiClock, label: 'Pending Approval', value: stats.pendingUsers },
        { icon: FiShare2, label: 'Total Shares', value: stats.totalShares },
        { icon: FiShare2, label: 'Active Shares', value: stats.activeShares },
        { icon: FiShare2, label: 'Expired Shares', value: stats.expiredShares },
        { icon: FiFile, label: 'Total Files', value: stats.totalFiles },
        { icon: FiDownload, label: 'Total Downloads', value: stats.totalDownloads },
        { icon: FiEye, label: 'Total Views', value: stats.totalViews },
        { icon: FiHardDrive, label: 'Storage Used', value: formatSize(stats.storageUsedBytes) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stats ? cards.map((c) => <StatsCard key={c.label} {...c} />) : Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      {stats?.pendingUsers > 0 && (
        <div className="neu-flat rounded-2xl p-4 text-sm text-accent-600 dark:text-accent-400">
          {stats.pendingUsers} account{stats.pendingUsers > 1 ? 's are' : ' is'} waiting for approval — review them under <strong>Users</strong>.
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
