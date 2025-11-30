import React, { useState, useEffect } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('admin-token');
    const storedAdminUser = localStorage.getItem('admin-user');
    
    if (adminToken && storedAdminUser) {
      try {
        const user = JSON.parse(storedAdminUser);
        setAdminUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
}


