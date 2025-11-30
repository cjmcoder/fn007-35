import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/store/useAuth';
import { useUserStats } from '@/services/leaderboardService';
import { PropHistory } from '@/components/props/PropHistory';
import { 
  User, 
  Crown, 
  Shield, 
  Star, 
  Trophy, 
  Target, 
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Award,
  Activity,
  Settings,
  Edit,
  Mail,
  Phone,
  Globe,
  Gamepad2,
  Zap,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Medal,
  TrendingDown
} from 'lucide-react';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { stats: leaderboardStats, loading: statsLoading } = useUserStats(user?.id || '');

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <User className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Please Sign In</h3>
          <p className="text-muted-foreground">Sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: User },
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

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLevelProgress = (experience: number, level: number) => {
    const currentLevelExp = level * 1000;
    const nextLevelExp = (level + 1) * 1000;
    const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user.profile?.avatarUrl || '/images/default-avatar.png'} alt={user.displayName} />
                <AvatarFallback className="bg-gradient-primary text-background text-xl font-bold">
                  {user.displayName?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.flags?.isVip && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center shadow-glow">
                  <Crown className="w-4 h-4 text-background" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold gradient-text">{user.displayName || user.username}</h1>
                <div className="flex space-x-2">
                  {getRoleBadge(user.role)}
                  {user.isAdmin && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.profile?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {user.profile?.bio && (
                <p className="text-foreground mb-4">{user.profile.bio}</p>
              )}

              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gradient-primary hover:shadow-glow text-background"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                {user.isAdmin && (
                  <Button 
                    onClick={() => window.location.href = '/admin'}
                    className="bg-gradient-secondary hover:shadow-glow text-background"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Star className="w-6 h-6 text-background" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                <p className={`text-2xl font-bold ${getTrustScoreColor(user.trustScore)}`}>{user.trustScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-glow">
                <Trophy className="w-6 h-6 text-background" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-foreground">{user.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <DollarSign className="w-6 h-6 text-background" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(user.walletBalance?.fc || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-glow">
                <Award className="w-6 h-6 text-background" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Reputation</p>
                <p className="text-2xl font-bold text-foreground">{user.reputation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          <TabsTrigger value="gaming">Gaming Stats</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Progress */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="gradient-text">Level Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Level {user.level}</span>
                    <span className="text-sm text-muted-foreground">{user.experience.toLocaleString()} XP</span>
                  </div>
                  <Progress value={getLevelProgress(user.experience, user.level)} className="h-2" />
                  <div className="text-center text-sm text-muted-foreground">
                    {((user.level + 1) * 1000 - user.experience).toLocaleString()} XP to Level {user.level + 1}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="gradient-text">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Email Verified</span>
                    <div className="flex items-center space-x-2">
                      {user.profile?.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {user.profile?.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">KYC Status</span>
                    <Badge className={
                      user.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-300' :
                      user.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }>
                      {user.kycStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Account Type</span>
                    <div className="flex items-center space-x-1">
                      {user.flags?.isVip && <Crown className="w-4 h-4 text-accent" />}
                      {user.flags?.isTrustedTrader && <Shield className="w-4 h-4 text-primary" />}
                      <span className="text-sm text-muted-foreground">
                        {user.flags?.isVip ? 'VIP' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-foreground">@{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                    <p className="text-foreground">{user.displayName || user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground">{user.profile?.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                    <p className="text-foreground">{user.profile?.timezone || 'UTC'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-foreground">{formatDate(user.lastLoginAt || user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard Stats */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Your Ranking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading stats...</p>
                  </div>
                ) : leaderboardStats ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {leaderboardStats.rank <= 3 ? (
                          <Crown className="w-8 h-8 text-yellow-500" />
                        ) : (
                          <Medal className="w-8 h-8 text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Overall Rank</p>
                          <p className="text-2xl font-bold text-primary">#{leaderboardStats.rank}</p>
                        </div>
                      </div>
                      <Badge className={leaderboardStats.rank <= 10 ? 'bg-yellow-500/20 text-yellow-600' : 'bg-primary/20 text-primary'}>
                        {leaderboardStats.rank <= 3 ? 'TOP 3' : leaderboardStats.rank <= 10 ? 'TOP 10' : 'RANKED'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Score</p>
                        <p className="text-xl font-bold text-foreground">{leaderboardStats.score.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Games Played</p>
                        <p className="text-xl font-bold text-foreground">{leaderboardStats.gamesPlayed}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                        <p className="text-xl font-bold text-foreground">{leaderboardStats.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                        <p className="text-xl font-bold text-foreground flex items-center">
                          <span className={leaderboardStats.currentStreak > 0 ? 'text-green-600' : 'text-red-600'}>
                            {leaderboardStats.currentStreak > 0 ? '🔥' : '❄️'} {Math.abs(leaderboardStats.currentStreak)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No leaderboard data available</p>
                    <p className="text-xs text-muted-foreground">Play some matches to get ranked!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-secondary" />
                  <span>Achievements & Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardStats?.badges && leaderboardStats.badges.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardStats.badges.map((badge, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{badge.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">Achievement unlocked</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No achievements yet</p>
                    <p className="text-xs text-muted-foreground">Keep playing to unlock badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-gradient-primary hover:shadow-glow">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Full Leaderboard
                </Button>
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Play Match
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Improve Ranking
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="props" className="space-y-6">
          <PropHistory />
        </TabsContent>

        <TabsContent value="gaming" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold text-foreground">{user.stats?.totalMatches || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-secondary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold text-foreground">{(user.stats?.winRate || 0).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(user.stats?.totalEarnings || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{user.stats?.totalWins || 0}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{user.stats?.totalLosses || 0}</p>
                  <p className="text-sm text-muted-foreground">Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{user.stats?.totalMatches || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{(user.stats?.winRate || 0).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(user.walletBalance?.fc || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Lock className="w-8 h-8 text-secondary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Locked Funds</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(user.walletBalance?.lockedFC || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Deposited</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(user.stats?.totalDeposits || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">Wallet History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Total Deposits</p>
                      <p className="text-sm text-muted-foreground">All time</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(user.stats?.totalDeposits || 0)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Total Withdrawals</p>
                      <p className="text-sm text-muted-foreground">All time</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(user.stats?.totalWithdrawals || 0)}</p>
                </div>

                <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Gaming Earnings</p>
                      <p className="text-sm text-muted-foreground">From matches and tournaments</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(user.stats?.totalEarnings || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates about your account and matches</p>
                  </div>
                  <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Privacy Settings</p>
                    <p className="text-sm text-muted-foreground">Control who can see your profile and activity</p>
                  </div>
                  <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                    Manage
                  </Button>
                </div>

                {user.isAdmin && (
                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <div>
                      <p className="font-medium text-foreground">Admin Panel Access</p>
                      <p className="text-sm text-muted-foreground">Access administrative tools and user management</p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/admin'}
                      className="bg-gradient-secondary hover:shadow-glow text-background"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Open Admin Panel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
