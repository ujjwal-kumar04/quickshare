import { FiFile } from 'react-icons/fi';

/**
 * Renders inline previews for images / PDFs / plain text via the
 * backend's /api/files/:id/preview endpoint; falls back to a
 * download-only prompt for unsupported formats.
 */
const FilePreview = ({ file, previewUrl }) => {
  if (file.fileType === 'image') {
    return <img src={previewUrl} alt={file.originalName} className="max-h-[70vh] w-full rounded-2xl object-contain" />;
  }
  if (file.fileType === 'pdf') {
    return <iframe title={file.originalName} src={previewUrl} className="h-[70vh] w-full rounded-2xl" />;
  }
  if (file.fileType === 'txt') {
    return <iframe title={file.originalName} src={previewUrl} className="h-[50vh] w-full rounded-2xl bg-white" />;
  }
  return (
    <div className="neu-flat flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
      <FiFile className="h-8 w-8 text-slate-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Preview not available for this file type.</p>
    </div>
  );
};

export default FilePreview;
