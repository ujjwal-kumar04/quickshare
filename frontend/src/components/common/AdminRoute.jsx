import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking permissions..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default AdminRoute;
