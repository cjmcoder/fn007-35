import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Crown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Mail,
  Calendar,
  DollarSign,
  Target,
  Trophy,
  Star,
  Settings,
  Key,
  Lock,
  Unlock,
  Trash2,
  Send,
  UserCheck,
  UserX,
  Award,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'banned' | 'suspended' | 'pending_verification';
  isVerified: boolean;
  isEmailVerified: boolean;
  trustScore: number;
  reputation: number;
  level: number;
  experience: number;
  createdAt: string;
  lastLoginAt?: string;
  lastActiveAt: string;
  loginCount: number;
  profile: {
    bio?: string;
    location?: string;
    timezone?: string;
    preferences: string;
    socialLinks?: {
      twitch?: string;
      discord?: string;
      youtube?: string;
    };
  };
  stats: {
    totalMatches: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalEarnings: number;
    totalDeposits: number;
    totalWithdrawals: number;
    currentBalance: number;
    lockedBalance: number;
  };
  flags: {
    isHighRisk: boolean;
    isVip: boolean;
    hasViolations: boolean;
    isTrustedTrader: boolean;
  };
  violations: {
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
    resolved: boolean;
  }[];
}

interface UserManagerProps {
  className?: string;
}

export const UserManager: React.FC<UserManagerProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'flocknodeadmin',
      email: 'flocknodeadmin@flocknode.com',
      displayName: 'FLOCKNODE Admin',
      role: 'super_admin',
      status: 'active',
      isVerified: true,
      isEmailVerified: true,
      trustScore: 100,
      reputation: 1000,
      level: 50,
      experience: 50000,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      loginCount: 150,
      profile: {
        bio: 'FLOCKNODE Platform Administrator',
        location: 'Global',
        timezone: 'UTC',
        preferences: '{"theme":"dark","notifications":true}',
        socialLinks: {
          twitch: 'flocknode',
          discord: 'flocknode#1234'
        }
      },
      stats: {
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalEarnings: 0,
        totalDeposits: 15000,
        totalWithdrawals: 5000,
        currentBalance: 10000,
        lockedBalance: 0
      },
      flags: {
        isHighRisk: false,
        isVip: true,
        hasViolations: false,
        isTrustedTrader: true
      },
      violations: []
    },
    {
      id: '2',
      username: 'demo_user',
      email: 'demo@flocknode.com',
      displayName: 'Demo User',
      role: 'user',
      status: 'active',
      isVerified: true,
      isEmailVerified: true,
      trustScore: 85,
      reputation: 450,
      level: 25,
      experience: 25000,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      loginCount: 75,
      profile: {
        bio: 'Demo user for testing purposes',
        location: 'United States',
        timezone: 'America/New_York',
        preferences: '{"theme":"dark","notifications":true}'
      },
      stats: {
        totalMatches: 150,
        totalWins: 95,
        totalLosses: 55,
        winRate: 63.3,
        totalEarnings: 2500,
        totalDeposits: 2000,
        totalWithdrawals: 750,
        currentBalance: 1000,
        lockedBalance: 250
      },
      flags: {
        isHighRisk: false,
        isVip: false,
        hasViolations: false,
        isTrustedTrader: false
      },
      violations: []
    },
    {
      id: '3',
      username: 'problematic_user',
      email: 'problem@example.com',
      displayName: 'Problematic User',
      role: 'user',
      status: 'suspended',
      isVerified: false,
      isEmailVerified: false,
      trustScore: 25,
      reputation: -100,
      level: 5,
      experience: 2500,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      loginCount: 12,
      profile: {
        bio: 'User with multiple violations',
        location: 'Unknown',
        timezone: 'UTC',
        preferences: '{"theme":"light","notifications":false}'
      },
      stats: {
        totalMatches: 25,
        totalWins: 8,
        totalLosses: 17,
        winRate: 32.0,
        totalEarnings: -500,
        totalDeposits: 500,
        totalWithdrawals: 0,
        currentBalance: 0,
        lockedBalance: 0
      },
      flags: {
        isHighRisk: true,
        isVip: false,
        hasViolations: true,
        isTrustedTrader: false
      },
      violations: [
        {
          id: 'v1',
          type: 'cheating',
          description: 'Using aimbot in competitive match',
          severity: 'high',
          createdAt: new Date().toISOString(),
          resolved: false
        },
        {
          id: 'v2',
          type: 'harassment',
          description: 'Inappropriate language in chat',
          severity: 'medium',
          createdAt: new Date().toISOString(),
          resolved: true
        }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    displayName: '',
    role: 'user' as const,
    status: 'active' as const,
    isVerified: false,
    isEmailVerified: false,
    trustScore: 50,
    bio: '',
    location: '',
    timezone: 'UTC'
  });

  const { toast } = useToast();

  const handleUserAction = (userId: string, action: string, data?: any) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let updatedUser = { ...user };
    let message = '';

    switch (action) {
      case 'ban':
        updatedUser.status = 'banned';
        message = 'User banned successfully';
        break;
      case 'suspend':
        updatedUser.status = 'suspended';
        message = 'User suspended successfully';
        break;
      case 'activate':
        updatedUser.status = 'active';
        message = 'User activated successfully';
        break;
      case 'verify':
        updatedUser.isVerified = true;
        message = 'User verified successfully';
        break;
      case 'unverify':
        updatedUser.isVerified = false;
        message = 'User verification removed';
        break;
      case 'promote':
        updatedUser.role = data.role;
        message = `User promoted to ${data.role}`;
        break;
      case 'demote':
        updatedUser.role = 'user';
        message = 'User demoted to regular user';
        break;
      case 'delete':
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSelectedUser(null);
        message = 'User deleted successfully';
        break;
      case 'reset_password':
        message = 'Password reset email sent';
        break;
      case 'send_message':
        message = 'Message sent to user';
        break;
    }

    if (action !== 'delete') {
      updatedUser.lastActiveAt = new Date().toISOString();
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      setSelectedUser(updatedUser);
    }

    toast({
      title: "User Action Completed",
      description: message,
    });
  };

  const handleCreateUser = () => {
    setIsCreating(true);
    setEditForm({
      username: '',
      email: '',
      displayName: '',
      role: 'user',
      status: 'active',
      isVerified: false,
      isEmailVerified: false,
      trustScore: 50,
      bio: '',
      location: '',
      timezone: 'UTC'
    });
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setEditForm({
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      trustScore: user.trustScore,
      bio: user.profile.bio || '',
      location: user.profile.location || '',
      timezone: user.profile.timezone || 'UTC'
    });
  };

  const handleSaveUser = () => {
    if (!editForm.username || !editForm.email) {
      toast({
        title: "Validation Error",
        description: "Username and email are required.",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      const newUser: User = {
        id: Date.now().toString(),
        username: editForm.username,
        email: editForm.email,
        displayName: editForm.displayName || editForm.username,
        role: editForm.role,
        status: editForm.status,
        isVerified: editForm.isVerified,
        isEmailVerified: editForm.isEmailVerified,
        trustScore: editForm.trustScore,
        reputation: 0,
        level: 1,
        experience: 0,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        loginCount: 0,
        profile: {
          bio: editForm.bio,
          location: editForm.location,
          timezone: editForm.timezone,
          preferences: '{"theme":"dark","notifications":true}'
        },
        stats: {
          totalMatches: 0,
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          totalEarnings: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          currentBalance: 0,
          lockedBalance: 0
        },
        flags: {
          isHighRisk: false,
          isVip: false,
          hasViolations: false,
          isTrustedTrader: false
        },
        violations: []
      };

      setUsers(prev => [newUser, ...prev]);
      toast({
        title: "User Created",
        description: "New user created successfully.",
      });
    } else if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        username: editForm.username,
        email: editForm.email,
        displayName: editForm.displayName,
        role: editForm.role,
        status: editForm.status,
        isVerified: editForm.isVerified,
        isEmailVerified: editForm.isEmailVerified,
        trustScore: editForm.trustScore,
        profile: {
          ...selectedUser.profile,
          bio: editForm.bio,
          location: editForm.location,
          timezone: editForm.timezone
        }
      };

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      toast({
        title: "User Updated",
        description: "User information updated successfully.",
      });
    }

    setIsCreating(false);
    setIsEditing(false);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Users },
      moderator: { color: 'bg-green-100 text-green-800 border-green-300', icon: Shield },
      admin: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Crown },
      super_admin: { color: 'bg-red-100 text-red-800 border-red-300', icon: Crown }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock },
      banned: { color: 'bg-red-100 text-red-800 border-red-300', icon: Ban },
      suspended: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
      pending_verification: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: UserCheck }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    verifiedUsers: users.filter(u => u.isVerified).length,
    adminUsers: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    highRiskUsers: users.filter(u => u.flags.isHighRisk).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Users className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">User Manager</h2>
            <p className="text-muted-foreground">Comprehensive user management and administration</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLoading(true)} className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateUser} className="bg-gradient-primary hover:shadow-glow text-background">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          <Button className="bg-gradient-secondary hover:shadow-glow text-background">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Ban className="w-8 h-8 text-destructive" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.bannedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.verifiedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.highRiskUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit User Form */}
      {(isCreating || isEditing) && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">
              {isCreating ? 'Create New User' : 'Edit User'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter display name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={editForm.role} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={editForm.status} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trustScore">Trust Score</Label>
                  <Input
                    id="trustScore"
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.trustScore}
                    onChange={(e) => setEditForm(prev => ({ ...prev, trustScore: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="User bio"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="User location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={editForm.timezone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="User timezone"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVerified"
                      checked={editForm.isVerified}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isVerified: checked }))}
                    />
                    <Label htmlFor="isVerified">Verified</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isEmailVerified"
                      checked={editForm.isEmailVerified}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isEmailVerified: checked }))}
                    />
                    <Label htmlFor="isEmailVerified">Email Verified</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(false); }} className="border-primary/30 text-primary hover:bg-primary/10">
                Cancel
              </Button>
              <Button onClick={handleSaveUser} className="bg-gradient-primary hover:shadow-glow text-background">
                {isCreating ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending_verification">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-primary/20 glass-card hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                        <Users className="w-5 h-5 text-background" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">@{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Trust Score</p>
                      <p className={`font-semibold ${getTrustScoreColor(user.trustScore)}`}>{user.trustScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Level</p>
                      <p className="font-semibold text-foreground">{user.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{user.email}</span>
                    <span>Created: {formatDate(user.createdAt)}</span>
                  </div>

                  {user.flags.isHighRisk && (
                    <div className="mt-2">
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        High Risk
                      </Badge>
                    </div>
                  )}
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
                  <p className="text-muted-foreground">No users match your current filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">User Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                        <Users className="w-8 h-8 text-background" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">@{selectedUser.username}</h3>
                        <p className="text-muted-foreground">{selectedUser.displayName}</p>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Trust Score</p>
                      <p className={`text-lg font-semibold ${getTrustScoreColor(selectedUser.trustScore)}`}>{selectedUser.trustScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="text-lg font-semibold text-foreground">{selectedUser.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reputation</p>
                      <p className="text-lg font-semibold text-foreground">{selectedUser.reputation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="text-lg font-semibold text-foreground">{selectedUser.experience.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedUser.profile.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p className="text-foreground">{selectedUser.profile.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Matches</p>
                      <p className="font-semibold text-foreground">{selectedUser.stats.totalMatches}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="font-semibold text-foreground">{selectedUser.stats.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-semibold text-foreground">{formatCurrency(selectedUser.stats.currentBalance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="font-semibold text-foreground">{formatCurrency(selectedUser.stats.totalEarnings)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Created: {formatDate(selectedUser.createdAt)}</span>
                    <span>Last Active: {formatDate(selectedUser.lastActiveAt)}</span>
                  </div>

                  {selectedUser.flags.isHighRisk && (
                    <div className="mb-4">
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        High Risk User
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleEditUser(selectedUser)}
                      className="bg-gradient-primary hover:shadow-glow text-background"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                    
                    {selectedUser.status === 'active' ? (
                      <Button 
                        onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleUserAction(selectedUser.id, 'activate')}
                        className="bg-gradient-secondary hover:shadow-glow text-background"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    )}

                    <Button 
                      onClick={() => handleUserAction(selectedUser.id, 'ban')}
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </Button>

                    <Button 
                      onClick={() => handleUserAction(selectedUser.id, 'reset_password')}
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>

                    {selectedUser.role !== 'user' && (
                      <Button 
                        onClick={() => handleUserAction(selectedUser.id, 'demote')}
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Demote
                      </Button>
                    )}

                    {selectedUser.role === 'user' && (
                      <Button 
                        onClick={() => handleUserAction(selectedUser.id, 'promote', { role: 'moderator' })}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Promote
                      </Button>
                    )}

                    <Button 
                      onClick={() => handleUserAction(selectedUser.id, 'send_message')}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>

                    <Button 
                      onClick={() => handleUserAction(selectedUser.id, 'delete')}
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>

                {/* Violations */}
                {selectedUser.violations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Violations</h4>
                    <div className="space-y-2">
                      {selectedUser.violations.map((violation) => (
                        <div key={violation.id} className="p-3 bg-card/50 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground">{violation.type}</span>
                            <Badge className={violation.severity === 'high' ? 'bg-red-100 text-red-800 border-red-300' : 
                                               violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                               'bg-blue-100 text-blue-800 border-blue-300'}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{violation.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(violation.createdAt)} - {violation.resolved ? 'Resolved' : 'Open'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a User</h3>
                <p className="text-muted-foreground">Choose a user from the list to view details and manage their account.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManager;


