import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PropBuilder } from './PropBuilder';
import { ChallengeBuilder } from './ChallengeBuilder';
import { WalletManager } from './WalletManager';
import { DisputeManager } from './DisputeManager';
import { UserManager } from './UserManager';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  DollarSign, 
  Activity,
  UserPlus,
  UserMinus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  RefreshCw,
  Target,
  Trophy,
  Wallet,
  Gavel
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: any;
  onLogout: () => void;
  className?: string;
}


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  adminUser, 
  onLogout, 
  className = '' 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalMatches: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'flocknodeadmin',
          email: 'flocknodeadmin@flocknode.com',
          displayName: 'FLOCKNODE Admin',
          roles: ['admin'],
          trustScore: 100,
          isAdmin: true,
          isBanned: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          wallet: {
            availableFc: 10000,
            lockedFc: 0,
            totalDeposited: 10000,
            totalWithdrawn: 0
          }
        },
        {
          id: '2',
          username: 'demo_user',
          email: 'demo@flocknode.com',
          displayName: 'Demo User',
          roles: ['user'],
          trustScore: 85,
          isAdmin: false,
          isBanned: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          wallet: {
            availableFc: 1000,
            lockedFc: 0,
            totalDeposited: 1000,
            totalWithdrawn: 0
          }
        }
      ];

      setUsers(mockUsers);
      setStats({
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => !u.isBanned).length,
        totalRevenue: mockUsers.reduce((sum, u) => sum + u.wallet.totalDeposited, 0),
        totalMatches: 47 // Mock data
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    toast({
      title: "Action Executed",
      description: `${action} action performed on user ${userId}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('admin')) {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">User</Badge>;
  };

  const getStatusBadge = (isBanned: boolean) => {
    return isBanned ? 
      <Badge className="bg-red-100 text-red-800">Banned</Badge> :
      <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  return (
    <div className={`min-h-screen bg-background p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {adminUser.displayName}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="props">Prop Builder</TabsTrigger>
          <TabsTrigger value="challenges">Challenge Builder</TabsTrigger>
          <TabsTrigger value="wallets">Wallet Manager</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Manager</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManager />
        </TabsContent>

        <TabsContent value="props" className="space-y-6">
          <PropBuilder />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <ChallengeBuilder />
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <WalletManager />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <DisputeManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Detailed analytics and reporting will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminUser.email}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Display Name</Label>
                  <Input
                    id="admin-name"
                    value={adminUser.displayName}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="pt-4">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
