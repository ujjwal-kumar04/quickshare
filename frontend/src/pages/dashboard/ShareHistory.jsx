import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCopy, FiCode, FiTrash2, FiEyeOff, FiExternalLink } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import useClipboard from '../../hooks/useClipboard';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import QRCodeModal from '../../components/share/QRCodeModal';

const STATUS_STYLES = {
  active: 'bg-success/15 text-success',
  expired: 'bg-slate-400/15 text-slate-400',
  disabled: 'bg-danger/15 text-danger',
  used: 'bg-accent-400/15 text-accent-500',
};

const ShareHistory = () => {
  const [shares, setShares] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [qrShare, setQrShare] = useState(null);
  const { copy } = useClipboard();

  const load = async () => {
    setError(null);
    try {
      const { data } = await api.get('/shares/my');
      setShares(data.data.shares);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  const handleDisable = async (id) => {
    try {
      await api.post(`/shares/${id}/disable`);
      toast.success('Share disabled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/shares/${confirmDelete}`);
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
  if (!shares) return <Loader label="Loading history..." />;

  if (shares.length === 0) {
    return <EmptyState title="You haven't created any shares yet." subtitle="Create one to see it here." />;
  }

  const columns = [
    { key: 'shareKey', header: 'Share Key', render: (r) => <span className="font-semibold text-accent-500">{r.shareKey}</span> },
    { key: 'fileCount', header: 'Files', render: (r) => (r.fileCount > 0 ? `${r.fileCount} file(s)` : r.text ? 'Text only' : '—') },
    { key: 'createdAt', header: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'views', header: 'Views' },
    { key: 'downloads', header: 'Downloads' },
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
          <button className="neu-icon-btn h-8 w-8 text-slate-400" title="Copy key" onClick={() => copy(r.shareKey, 'Key copied')}><FiCopy className="h-3.5 w-3.5" /></button>
          <button className="neu-icon-btn h-8 w-8 text-slate-400" title="Copy link" onClick={() => copy(`${window.location.origin}/share/${r.shareKey}`, 'Link copied')}><FiExternalLink className="h-3.5 w-3.5" /></button>
          <button className="neu-icon-btn h-8 w-8 text-slate-400" title="QR Code" onClick={() => setQrShare(r)}><FiCode className="h-3.5 w-3.5" /></button>
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
      <h1 className="mb-6 text-2xl font-bold text-slate-700 dark:text-slate-100">Share History</h1>
      <div className="neu-card rounded-neu p-5">
        <DataTable columns={columns} rows={shares} keyField="_id" />
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

      <QRCodeModal open={Boolean(qrShare)} onClose={() => setQrShare(null)} value={qrShare ? `${window.location.origin}/share/${qrShare.shareKey}` : ''} />
    </div>
  );
};

export default ShareHistory;
