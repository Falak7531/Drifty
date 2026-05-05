import { Navigate } from 'react-router-dom';
import useAuth from '../contexts/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <p className="text-slate-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;