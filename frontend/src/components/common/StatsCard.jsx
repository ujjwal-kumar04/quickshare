const StatsCard = ({ icon: Icon, label, value, accent = false }) => (
  <div className="neu-card flex items-center gap-4 rounded-neu p-5">
    <div className={`neu-inset flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent ? 'text-accent-500' : 'text-slate-400'}`}>
      {Icon && <Icon className="h-5 w-5" />}
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-700 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

export default StatsCard;
