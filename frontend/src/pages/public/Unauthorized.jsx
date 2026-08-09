import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="neu-card mx-auto max-w-md rounded-neu p-10 text-center">
    <p className="text-6xl font-extrabold text-danger">403</p>
    <h1 className="mt-2 text-xl font-semibold text-slate-600 dark:text-slate-300">Access denied</h1>
    <p className="mt-1 text-sm text-slate-400">You don't have permission to view this page.</p>
    <Link to="/">
      <button className="neu-btn mt-6 rounded-2xl px-6 py-2.5 font-medium text-accent-600 dark:text-accent-400">Go Home</button>
    </Link>
  </div>
);

export default Unauthorized;
