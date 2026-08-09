const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="h-10 w-10 rounded-full border-4 border-accent-500/30 border-t-accent-500 animate-spin" />
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

export default Loader;
