import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, mirrors backend MAX_FILE_SIZE
const MAX_FILES = 10;

const Dropzone = ({ files, setFiles }) => {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected?.length) {
        rejected.forEach((r) => toast.error(`${r.file.name}: ${r.errors[0]?.message || 'Rejected'}`));
      }
      setFiles((prev) => {
        const combined = [...prev, ...accepted];
        if (combined.length > MAX_FILES) {
          toast.error(`Maximum ${MAX_FILES} files per share`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-powerpoint': [],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
      'text/plain': [],
      'text/csv': [],
      'application/zip': [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`neu-inset flex cursor-pointer flex-col items-center justify-center gap-2 rounded-neu px-6 py-10 text-center transition-transform ${
        isDragActive ? 'scale-[0.99]' : ''
      }`}
    >
      <input {...getInputProps()} />
      <div className="neu-flat flex h-14 w-14 items-center justify-center rounded-full text-accent-500">
        <FiUploadCloud className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {isDragActive ? 'Drop your files here' : 'Drag & drop files, or click to browse'}
      </p>
      <p className="text-xs text-slate-400">Images, PDF, Word, Excel, PowerPoint, TXT, CSV, ZIP — up to 10MB each</p>
    </div>
  );
};

export default Dropzone;
