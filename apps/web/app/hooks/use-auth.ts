'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual auth check
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
