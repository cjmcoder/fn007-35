import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TestSignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg">
      <div className="text-sm font-bold mb-2">TEST SIGN IN BUTTON</div>
      <Button 
        size="sm"
        onClick={() => navigate('/login')}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
      >
        <LogIn className="w-4 h-4 mr-2" />
        TEST SIGN IN
      </Button>
    </div>
  );
};























