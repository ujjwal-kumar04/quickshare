import { useState } from 'react';
import toast from 'react-hot-toast';

const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = async (text, label = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return { copy, copied };
};

export default useClipboard;
