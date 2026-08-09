import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiLock, FiClock, FiZapOff } from 'react-icons/fi';
import api, { getErrorMessage } from '../../services/api';
import Dropzone from '../../components/share/Dropzone';
import FileCard from '../../components/share/FileCard';
import ShareKeyCard from '../../components/share/ShareKeyCard';
import QRCodeModal from '../../components/share/QRCodeModal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '10m', label: '10 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
];

const CreateShare = () => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('never');
  const [oneTime, setOneTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);

  const reset = () => {
    setText(''); setFiles([]); setPassword(''); setExpiry('never'); setOneTime(false); setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) {
      toast.error('Add some text or at least one file');
      return;
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('expiry', expiry);
    formData.append('oneTimeDownload', oneTime);
    if (password) formData.append('password', password);
    files.forEach((f) => formData.append('files', f));

    setLoading(true);
    try {
      const { data } = await api.post('/shares', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data);
      toast.success('Share created successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <ShareKeyCard shareKey={result.shareKey} shareLink={result.shareLink} />
        <Button variant="ghost" onClick={() => setQrOpen(true)} className="w-full">Show QR Code</Button>
        <Button variant="ghost" onClick={reset} className="w-full">Create Another Share</Button>
        <QRCodeModal open={qrOpen} onClose={() => setQrOpen(false)} value={result.shareLink} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-700 dark:text-slate-100">Create a Share</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="neu-card rounded-neu p-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">Text</label>
          <textarea
            rows={6}
            className="neu-input resize-none"
            placeholder="Paste notes, code, messages, or links..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="neu-card rounded-neu p-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">Files</label>
          <Dropzone files={files} setFiles={setFiles} />
          {files.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {files.map((f, i) => (
                <FileCard
                  key={`${f.name}-${i}`}
                  name={f.name}
                  size={f.size}
                  type="file"
                  onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}
        </div>

        <div className="neu-card grid gap-5 rounded-neu p-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <FiLock /> Password (optional)
            </label>
            <Input type="password" placeholder="Leave blank for no password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <FiClock /> Expiry
            </label>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="neu-input">
              {EXPIRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={oneTime} onChange={(e) => setOneTime(e.target.checked)} className="h-4 w-4 accent-accent-500" />
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <FiZapOff /> One-time download (share becomes inactive after first download)
            </span>
          </label>
        </div>

        <Button type="submit" loading={loading} className="w-full">Create Share</Button>
      </form>
    </div>
  );
};

export default CreateShare;
