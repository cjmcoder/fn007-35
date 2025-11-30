import { useAuth } from '@/store/useAuth';
import { useEffect } from 'react';

export const AuthStateTest = () => {
  const { isAuthenticated, user, initialize } = useAuth();

  useEffect(() => {
    // Initialize auth state on mount
    initialize();
  }, [initialize]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-lg shadow-lg text-xs">
      <div className="font-bold mb-1">AUTH STATE TEST</div>
      <div>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
      <div>User: {user?.username || 'None'}</div>
      <div>Token: {localStorage.getItem('flocknode-token') ? 'EXISTS' : 'NONE'}</div>
    </div>
  );
};























