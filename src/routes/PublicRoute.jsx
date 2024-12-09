import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export const PublicRoute = ({ children }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // For public routes like Impressum, we want to show the Layout
  // but for auth pages (Login, Register, ForgotPassword), we don't
  const authPages = ['Login', 'Register', 'ForgotPassword'];
  const isAuthPage = authPages.includes(children.type.name);

  if (isAuthPage) {
    return children;
  }

  return <Layout>{children}</Layout>;
};
