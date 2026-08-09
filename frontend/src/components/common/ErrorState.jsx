import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="neu-flat flex flex-col items-center justify-center gap-3 rounded-neu px-6 py-14 text-center">
    <div className="neu-inset flex h-16 w-16 items-center justify-center rounded-full">
      <FiAlertTriangle className="h-7 w-7 text-danger" />
    </div>
    <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
    {onRetry && <Button onClick={onRetry}>Try again</Button>}
  </div>
);

export default ErrorState;
