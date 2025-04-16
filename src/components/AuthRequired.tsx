
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthRequiredProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'architect') {
      return <Navigate to="/architect-dashboard" replace />;
    } else if (user.role === 'homeowner') {
      return <Navigate to="/homeowner-dashboard" replace />;
    }
    
    // Fallback to login if role is not recognized
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRequired;
