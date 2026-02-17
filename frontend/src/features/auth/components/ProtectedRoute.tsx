import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // If not logged in, redirect to login page and replace history
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes
  return <Outlet />;
}