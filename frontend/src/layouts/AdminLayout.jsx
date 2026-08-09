import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const AdminLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-4 inline-block rounded-full bg-accent-100 dark:bg-accent-700/20 px-3 py-1 text-xs font-semibold text-accent-600 dark:text-accent-400">
        Admin Area
      </div>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AdminLayout;
