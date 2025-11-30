import { useAuth } from '@/store/useAuth';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

export const AuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="text-xs">
        Loading...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isAuthenticated ? "default" : "destructive"} 
      className="text-xs flex items-center gap-1"
    >
      {isAuthenticated ? (
        <>
          <CheckCircle className="w-3 h-3" />
          {user?.username || 'Authenticated'}
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3" />
          Not Signed In
        </>
      )}
    </Badge>
  );
};























