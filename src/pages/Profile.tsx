import React from 'react';
import { UserProfile } from '@/components/profile/UserProfile';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/store/useAuth';

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <UserProfile />
      </div>
    </div>
  );
}
