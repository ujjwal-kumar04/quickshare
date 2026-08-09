import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon: Icon = FiInbox, title, subtitle, action }) => (
  <div className="neu-flat flex flex-col items-center justify-center gap-3 rounded-neu px-6 py-14 text-center">
    <div className="neu-inset flex h-16 w-16 items-center justify-center rounded-full">
      <Icon className="h-7 w-7 text-slate-400" />
    </div>
    <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300">{title}</h3>
    {subtitle && <p className="max-w-sm text-sm text-slate-400">{subtitle}</p>}
    {action}
  </div>
);

export default EmptyState;
