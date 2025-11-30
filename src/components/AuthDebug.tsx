import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthDebug = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 right-4 z-50 bg-background border border-border rounded-lg p-4 shadow-lg">
      <div className="text-sm space-y-2">
        <div className="font-bold">Auth Debug</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user?.username || 'None'}</div>
        
        <div className="flex gap-2">
          {!isAuthenticated ? (
            <Button 
              size="sm" 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                onClick={() => navigate('/my-profile')}
                className="bg-green-600 hover:bg-green-700"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button 
                size="sm" 
                onClick={() => logout()}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};























