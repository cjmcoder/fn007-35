'use client';

import { useAuth } from './hooks/use-auth';
import { LoginPage } from './components/auth/login-page';
import { DashboardPage } from './components/dashboard/dashboard-page';
import { LoadingSpinner } from './components/ui/loading-spinner';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}
