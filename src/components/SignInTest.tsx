import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

export const SignInTest = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="fixed top-20 left-4 z-50 bg-white border-2 border-red-500 p-4 rounded-lg shadow-lg max-w-sm">
      <div className="text-sm space-y-2">
        <div className="font-bold text-red-600">SIGN IN TEST</div>
        <div>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
        <div>User: {user?.username || 'None'}</div>
        
        <Button 
          size="sm"
          onClick={() => navigate('/login')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          TEST SIGN IN
        </Button>
        
        <div className="text-xs text-gray-600">
          This button should take you to the login page
        </div>
      </div>
    </div>
  );
};























