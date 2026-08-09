import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCopy, FiCheck, FiDownload, FiClock, FiArchive } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import useClipboard from '../../hooks/useClipboard';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import PasswordModal from '../../components/share/PasswordModal';
import FileCard from '../../components/share/FileCard';
import Modal from '../../components/common/Modal';
import FilePreview from '../../components/share/FilePreview';
import Button from '../../components/common/Button';

const ShareView = () => {
  const { shareKey } = useParams();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const { copy, copied } = useClipboard();

  const fetchShare = useCallback(
    async (password) => {
      setLoading(true);
      setError(null);
      setPwError('');
      try {
        const { data } = await api.get(`/shares/${shareKey}`, { params: password ? { password } : {} });
        if (data.data.requiresPassword) {
          setNeedsPassword(true);
        } else {
          setNeedsPassword(false);
          setShare(data.data);
        }
      } catch (err) {
        if (err.response?.status === 401 && needsPassword) {
          setPwError('Incorrect password');
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
        setPwLoading(false);
      }
    },
    [shareKey, needsPassword]
  );

  useEffect(() => {
    fetchShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareKey]);

  const handlePasswordSubmit = (password) => {
    setPwLoading(true);
    fetchShare(password);
  };

  const downloadFile = (fileId, name) => {
    const url = `${api.defaults.baseURL}/files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const downloadAll = () => {
    window.location.href = `${api.defaults.baseURL}/files/share/${share.shareKey}/download-all`;
  };

  if (loading && !needsPassword) return <Loader label="Retrieving share..." />;
  if (error) return <ErrorState message={error} onRetry={() => fetchShare()} />;

  if (needsPassword) {
    return <PasswordModal open onSubmit={handlePasswordSubmit} loading={pwLoading} error={pwError} />;
  }

  if (!share) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-700 dark:text-slate-100">Share {share.shareKey}</h1>
        {share.expiryTime && (
          <span className="neu-flat flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-slate-400">
            <FiClock /> Expires {new Date(share.expiryTime).toLocaleString()}
          </span>
        )}
      </div>

      {share.text && (
        <div className="neu-card mb-6 rounded-neu p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Shared text</span>
            <button
              onClick={() => copy(share.text)}
              className="neu-icon-btn h-8 w-8 text-slate-400"
              aria-label="Copy text"
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
          <pre className="neu-inset whitespace-pre-wrap break-words rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
            {share.text}
          </pre>
        </div>
      )}

      {share.files?.length > 0 && (
        <div className="neu-card rounded-neu p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Files ({share.files.length})
            </span>
            {share.files.length > 1 && (
              <Button variant="ghost" onClick={downloadAll} className="!px-3 !py-1.5 text-xs">
                <FiArchive className="mr-1 inline" /> Download All
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {share.files.map((f) => (
              <FileCard
                key={f._id}
                name={f.originalName}
                size={f.fileSize}
                type={f.fileType}
                onPreview={['image', 'pdf', 'txt'].includes(f.fileType) ? () => setPreviewFile(f) : undefined}
                onDownload={() => downloadFile(f._id, f.originalName)}
              />
            ))}
          </div>
        </div>
      )}

      {previewFile && (
        <Modal open onClose={() => setPreviewFile(null)} title={previewFile.originalName} className="max-w-2xl">
          <FilePreview file={previewFile} previewUrl={`${api.defaults.baseURL}/files/${previewFile._id}/preview`} />
        </Modal>
      )}
    </div>
  );
};

export default ShareView;
