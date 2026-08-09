import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiLock, FiUnlock, FiTrash2, FiSearch } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';

const STATUS_STYLES = {
  approved: 'bg-success/15 text-success',
  pending: 'bg-accent-400/15 text-accent-500',
  rejected: 'bg-danger/15 text-danger',
};

const AdminUsers = () => {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const { data } = await api.get('/admin/users', { params: { search, status: statusFilter || undefined } });
      setUsers(data.data.users);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const act = async (id, action, successMsg) => {
    try {
      if (action === 'approve') await api.patch(`/admin/users/${id}/approve`);
      if (action === 'reject') await api.patch(`/admin/users/${id}/reject`);
      if (action === 'block') await api.patch(`/admin/users/${id}/block`);
      if (action === 'unblock') await api.patch(`/admin/users/${id}/unblock`);
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${confirmDelete}`);
      toast.success('User deleted');
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
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[r.status]} ${r.isBlocked ? 'opacity-60' : ''}`}>
          {r.isBlocked ? 'blocked' : r.status}
        </span>
      ),
    },
    { key: 'shareCount', header: 'Shares' },
    { key: 'createdAt', header: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {r.status === 'pending' && (
            <>
              <button className="neu-icon-btn h-8 w-8 text-success" title="Approve" onClick={() => act(r._id, 'approve', 'User approved')}><FiCheck className="h-3.5 w-3.5" /></button>
              <button className="neu-icon-btn h-8 w-8 text-danger" title="Reject" onClick={() => act(r._id, 'reject', 'User rejected')}><FiX className="h-3.5 w-3.5" /></button>
            </>
          )}
          {r.role !== 'admin' && (
            r.isBlocked ? (
              <button className="neu-icon-btn h-8 w-8 text-success" title="Unblock" onClick={() => act(r._id, 'unblock', 'User unblocked')}><FiUnlock className="h-3.5 w-3.5" /></button>
            ) : (
              <button className="neu-icon-btn h-8 w-8 text-slate-400" title="Block" onClick={() => act(r._id, 'block', 'User blocked')}><FiLock className="h-3.5 w-3.5" /></button>
            )
          )}
          {r.role !== 'admin' && (
            <button className="neu-icon-btn h-8 w-8 text-danger" title="Delete" onClick={() => setConfirmDelete(r._id)}><FiTrash2 className="h-3.5 w-3.5" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100">Users</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="!pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="neu-input w-40">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="neu-card rounded-neu p-5">
        {!users ? <Loader label="Loading users..." /> : <DataTable columns={columns} rows={users} keyField="_id" />}
      </div>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this user?"
        description="This permanently deletes the user and all of their shares. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminUsers;
