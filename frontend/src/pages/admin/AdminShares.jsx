import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiEyeOff, FiTrash2, FiSearch } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';

const STATUS_STYLES = {
  active: 'bg-success/15 text-success',
  expired: 'bg-slate-400/15 text-slate-400',
  disabled: 'bg-danger/15 text-danger',
  used: 'bg-accent-400/15 text-accent-500',
};

const AdminShares = () => {
  const [shares, setShares] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const { data } = await api.get('/admin/shares', { params: { search, status: statusFilter || undefined } });
      setShares(data.data.shares);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleDisable = async (id) => {
    try {
      await api.patch(`/admin/shares/${id}/disable`);
      toast.success('Share disabled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/shares/${confirmDelete}`);
      toast.success('Share deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  const columns = [
    { key: 'shareKey', header: 'Share Key', render: (r) => <span className="font-semibold text-accent-500">{r.shareKey}</span> },
    { key: 'user', header: 'Owner', render: (r) => r.user?.email || '—' },
    { key: 'views', header: 'Views' },
    { key: 'downloads', header: 'Downloads' },
    { key: 'createdAt', header: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[r.status] || ''}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {r.isActive && (
            <button className="neu-icon-btn h-8 w-8 text-slate-400" title="Disable" onClick={() => handleDisable(r._id)}><FiEyeOff className="h-3.5 w-3.5" /></button>
          )}
          <button className="neu-icon-btn h-8 w-8 text-danger" title="Delete" onClick={() => setConfirmDelete(r._id)}><FiTrash2 className="h-3.5 w-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Shares</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by share key" value={search} onChange={(e) => setSearch(e.target.value)} className="!pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="neu-input w-40">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      <div className="neu-card rounded-neu p-5">
        {!shares ? <Loader label="Loading shares..." /> : <DataTable columns={columns} rows={shares} keyField="_id" />}
      </div>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this share?"
        description="This permanently deletes the share and its files. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminShares;
