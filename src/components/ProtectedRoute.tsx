import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'manager' | 'mentor' | 'buddy';
  requiredRoles?: ('manager' | 'mentor' | 'buddy')[];
}

export default function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole} | Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required roles: {requiredRoles.join(', ')} | Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
