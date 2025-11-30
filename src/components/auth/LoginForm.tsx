import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className = '', onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Minimal validation - just check if fields have content
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', await response.text());
        setError('Server returned invalid response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        // Store user data in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Welcome back!",
          description: `Hello ${data.user.displayName || data.user.username}!`,
        });

        // Redirect to profile
        navigate('/profile');
        onSuccess?.();
      } else {
        setError(data.error || 'Login failed. Please try again.');
        toast({
          title: "Login Failed",
          description: data.error || 'Invalid credentials',
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`min-h-screen flex items-center justify-center bg-background p-4 ${className}`}>
      <Card className="w-full max-w-md glass-card border-primary/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <LogIn className="w-8 h-8 text-background" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Welcome to FLOCKNODE
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Sign in to your gaming account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-card/50 border-primary/20 text-foreground focus:ring-primary"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-card/50 border-primary/20 text-foreground focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow text-background font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
