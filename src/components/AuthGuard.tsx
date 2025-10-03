import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useVerifyTokenQuery } from '@/store/api/authApi';

type Props = {
  children: React.ReactNode;
};

const AuthGuard: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const { data, isLoading, error } = useVerifyTokenQuery();

  if (isLoading) {
    return (
      <main className="p-6 text-center text-sm text-muted-foreground">Verifying access...</main>
    );
  }

  // If verification failed or user role is not metro_admin, redirect to login
  const notAllowed = Boolean(error) || !data?.user || data.user.role !== 'metro_admin';
  if (notAllowed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;