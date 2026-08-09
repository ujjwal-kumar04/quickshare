import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <label className="block w-full">
    {label && <span className="mb-1.5 block text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>}
    <input ref={ref} className={`neu-input ${error ? 'ring-2 ring-danger/40' : ''} ${className}`} {...props} />
    {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
  </label>
));

Input.displayName = 'Input';
export default Input;
