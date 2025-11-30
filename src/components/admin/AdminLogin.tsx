import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (adminUser: any) => void;
  className?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if this is the admin user
      if (email === 'flocknodeadmin@flocknode.com' && password === 'Flocknode123') {
        const adminUser = {
          id: 'a6b6e4ba-0d29-4160-af0c-0d707c927138',
          username: 'flocknodeadmin',
          email: 'flocknodeadmin@flocknode.com',
          displayName: 'FLOCKNODE Admin',
          avatarUrl: null,
          roles: ['admin', 'user'],
          trustScore: 100,
          tfaEnabled: false,
          isBanned: false,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profile: {
            id: 'admin_profile_1',
            userId: 'a6b6e4ba-0d29-4160-af0c-0d707c927138',
            bio: 'FLOCKNODE Platform Administrator',
            location: null,
            timezone: null,
            preferences: '{}',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          wallet: {
            id: 'admin_wallet_1',
            userId: 'a6b6e4ba-0d29-4160-af0c-0d707c927138',
            availableFc: 10000,
            lockedFc: 0,
            totalDeposited: 10000,
            totalWithdrawn: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };

        // Store admin session
        localStorage.setItem('admin-token', 'admin_' + Date.now());
        localStorage.setItem('admin-user', JSON.stringify(adminUser));

        toast({
          title: "Admin Access Granted",
          description: "Welcome back, Administrator!",
        });

        onSuccess(adminUser);
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials. Please try again.",
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
              <Shield className="w-8 h-8 text-background" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            FLOCKNODE Admin
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Sign in to access the admin dashboard
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@flocknode.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
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
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In as Admin
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-card/50 border border-primary/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Admin Credentials:</p>
                <p>Email: flocknodeadmin@flocknode.com</p>
                <p>Password: Flocknode123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
