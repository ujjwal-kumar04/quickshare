import { FiFile, FiImage, FiFileText, FiX, FiDownload, FiEye } from 'react-icons/fi';

const ICONS = {
  image: FiImage,
  pdf: FiFileText,
  txt: FiFileText,
  csv: FiFileText,
  doc: FiFileText,
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
};

/**
 * Used both for local files pending upload (pass `onRemove`) and for
 * files already on a share (pass `onPreview` / `onDownload`).
 */
const FileCard = ({ name, size, type, progress, onRemove, onPreview, onDownload }) => {
  const Icon = ICONS[type] || FiFile;

  return (
    <div className="neu-flat flex items-center gap-3 rounded-2xl p-3">
      <div className="neu-inset flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-accent-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">{name}</p>
        <p className="text-xs text-slate-400">{formatSize(size)}</p>
        {typeof progress === 'number' && progress < 100 && (
          <div className="neu-inset mt-1 h-1.5 w-full overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {onPreview && (
          <button onClick={onPreview} className="neu-icon-btn h-8 w-8 text-slate-400" aria-label="Preview">
            <FiEye className="h-4 w-4" />
          </button>
        )}
        {onDownload && (
          <button onClick={onDownload} className="neu-icon-btn h-8 w-8 text-slate-400" aria-label="Download">
            <FiDownload className="h-4 w-4" />
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="neu-icon-btn h-8 w-8 text-danger" aria-label="Remove">
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FileCard;
