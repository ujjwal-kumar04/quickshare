import { FiCopy, FiCheck } from 'react-icons/fi';
import useClipboard from '../../hooks/useClipboard';

const ShareKeyCard = ({ shareKey, shareLink }) => {
  const { copy: copyKey, copied: keyCopied } = useClipboard();
  const { copy: copyLink, copied: linkCopied } = useClipboard();

  return (
    <div className="neu-card rounded-neu p-6 text-center">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Your share key</p>
      <p className="mb-4 text-2xl font-extrabold tracking-wider text-accent-600 dark:text-accent-400">{shareKey}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => copyKey(shareKey, 'Share key copied')}
          className="neu-btn flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {keyCopied ? <FiCheck /> : <FiCopy />} Copy Key
        </button>
        <button
          onClick={() => copyLink(shareLink, 'Share link copied')}
          className="neu-btn flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-accent-600 dark:text-accent-400"
        >
          {linkCopied ? <FiCheck /> : <FiCopy />} Copy Link
        </button>
      </div>
    </div>
  );
};

export default ShareKeyCard;
