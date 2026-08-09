import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

const Section = ({ title, children }) => (
  <div className="neu-card rounded-neu p-6">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
    {children}
  </div>
);

const Row = ({ left, right }) => (
  <div className="neu-flat flex items-center justify-between rounded-2xl p-3 text-sm">
    <span className="truncate text-slate-600 dark:text-slate-300">{left}</span>
    <span className="shrink-0 font-semibold text-accent-500">{right}</span>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const { data: res } = await api.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Loader label="Loading analytics..." />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Most Active Users">
          <div className="flex flex-col gap-2">
            {data.mostActiveUsers.map((u) => (
              <Row key={u._id} left={u.user.email} right={`${u.shareCount} shares`} />
            ))}
          </div>
        </Section>

        <Section title="File Type Distribution">
          <div className="flex flex-col gap-2">
            {data.fileTypeStats.map((f) => (
              <Row key={f._id} left={f._id} right={`${f.count} files · ${formatSize(f.totalSize)}`} />
            ))}
          </div>
        </Section>

        <Section title="Most Downloaded Shares">
          <div className="flex flex-col gap-2">
            {data.mostDownloadedShares.map((s) => (
              <Row key={s._id} left={s.shareKey} right={`${s.downloads} downloads`} />
            ))}
          </div>
        </Section>

        <Section title="Most Viewed Shares">
          <div className="flex flex-col gap-2">
            {data.mostViewedShares.map((s) => (
              <Row key={s._id} left={s.shareKey} right={`${s.views} views`} />
            ))}
          </div>
        </Section>

        <Section title="Recent Uploads">
          <div className="flex flex-col gap-2">
            {data.recentUploads.map((f) => (
              <Row key={f._id} left={f.originalName} right={new Date(f.createdAt).toLocaleDateString()} />
            ))}
          </div>
        </Section>

        <Section title="Recent Downloads">
          <div className="flex flex-col gap-2">
            {data.recentDownloads.map((d) => (
              <Row key={d._id} left={d.share?.shareKey || '—'} right={new Date(d.downloadedAt).toLocaleDateString()} />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Storage Usage">
        <p className="text-2xl font-bold text-slate-700 dark:text-slate-100">{formatSize(data.storageUsedBytes)}</p>
      </Section>
    </div>
  );
};

export default AdminAnalytics;
