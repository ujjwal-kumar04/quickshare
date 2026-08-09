const VARIANTS = {
  primary: 'text-accent-600 dark:text-accent-400 font-semibold',
  ghost: 'text-slate-500 dark:text-slate-400',
  danger: 'text-danger font-semibold',
};

const Button = ({ children, variant = 'primary', className = '', loading = false, disabled, ...props }) => (
  <button
    className={`neu-btn px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
    )}
    {children}
  </button>
);

export default Button;
