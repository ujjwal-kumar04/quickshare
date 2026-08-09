import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiZap } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-500 dark:text-slate-400 hover:text-accent-500'}`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const publicLinks = [
    { to: '/receive', label: 'Receive' },
  ];
  const authLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/create', label: 'Create Share' },
    { to: '/dashboard/history', label: 'History' },
    { to: '/dashboard/profile', label: 'Profile' },
  ];
  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/shares', label: 'Shares' },
    { to: '/admin/analytics', label: 'Analytics' },
  ];

  const links = user?.role === 'admin' ? adminLinks : isAuthenticated ? authLinks : publicLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="neu-card mx-auto flex max-w-6xl items-center justify-between rounded-neu px-5 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-700 dark:text-slate-100">
          <span className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl text-accent-500">
            <FiZap />
          </span>
          QuickShare
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/admin'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/register"><Button>Register</Button></Link>
            </>
          )}
        </div>

        <button className="neu-icon-btn h-10 w-10 md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {open && (
        <div className="neu-card mx-auto mt-2 flex max-w-6xl flex-col gap-3 rounded-neu p-5 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)} end={l.to === '/admin'}>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="ghost">Login</Button></Link>
                <Link to="/register" onClick={() => setOpen(false)}><Button>Register</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
