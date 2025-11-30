import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { userApi, walletApi } from '@/lib/api-client';
import { User } from '@/lib/api-client';
import { 
  User as UserIcon, 
  Trophy, 
  Target, 
  TrendingUp, 
  Settings, 
  Edit3,
  Save,
  X,
  Award,
  Star,
  Activity,
  DollarSign
} from 'lucide-react';

interface EnhancedProfileProps {
  userId?: string;
  className?: string;
}

interface ProfileStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
}

export const EnhancedProfile: React.FC<EnhancedProfileProps> = ({ 
  userId, 
  className = '' 
}) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalEarnings: 0,
    currentStreak: 0,
    bestStreak: 0,
    rank: 0
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const [profileData, balanceData] = await Promise.all([
        userId ? userApi.getUser(userId) : userApi.getMyProfile(),
        walletApi.getBalance()
      ]);

      setProfile(profileData);
      setWalletBalance(balanceData.available);
      
      // Initialize edit form with current data
      setEditForm({
        username: profileData.username || '',
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatarUrl || ''
      });

      // Calculate stats (mock data for now - replace with real API calls)
      setStats({
        totalMatches: 47,
        wins: 32,
        losses: 15,
        winRate: 68.1,
        totalEarnings: 1250.75,
        currentStreak: 5,
        bestStreak: 12,
        rank: 1247
      });

    } catch (error) {
      console.error('Failed to load profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would call the API to update the profile
      // await userApi.updateProfile(editForm);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setEditing(false);
      // Reload profile data
      await loadProfileData();
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Reset form to original values
    if (profile) {
      setEditForm({
        username: profile.username || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || ''
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 100) return { color: 'bg-yellow-100 text-yellow-800', label: 'Elite' };
    if (rank <= 500) return { color: 'bg-blue-100 text-blue-800', label: 'Master' };
    if (rank <= 1000) return { color: 'bg-green-100 text-green-800', label: 'Expert' };
    if (rank <= 2500) return { color: 'bg-purple-100 text-purple-800', label: 'Advanced' };
    return { color: 'bg-gray-100 text-gray-800', label: 'Rising' };
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Unable to load profile information.</p>
      </div>
    );
  }

  const rankInfo = getRankBadge(stats.rank);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.displayName || profile.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.displayName || profile.username}
                </h1>
                <Badge className={rankInfo.color}>
                  {rankInfo.label}
                </Badge>
                <Badge variant="outline">
                  Rank #{stats.rank}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">
                @{profile.username}
              </p>
              
              {profile.bio && (
                <p className="text-gray-700 mb-4">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>{stats.totalMatches} matches</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>{stats.wins}W - {stats.losses}L</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${stats.totalEarnings.toFixed(2)} earned</span>
                </div>
              </div>
            </div>
            
            {!userId && (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="self-start"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.bestStreak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">${walletBalance.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Available Balance</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="matches">Recent Matches</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Win Rate</span>
                    <span className="font-semibold">{stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-green-600">${stats.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Match Value</span>
                    <span className="font-semibold">${(stats.totalEarnings / stats.totalMatches).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Match History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Matches</span>
                    <span className="font-semibold">{stats.totalMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wins</span>
                    <span className="font-semibold text-green-600">{stats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Losses</span>
                    <span className="font-semibold text-red-600">{stats.losses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Match History</h3>
                <p className="text-gray-600">Your recent match results will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Achievements & Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'First Win', icon: Trophy, earned: true },
                  { name: 'Win Streak', icon: Star, earned: stats.currentStreak >= 5 },
                  { name: 'High Roller', icon: DollarSign, earned: stats.totalEarnings >= 1000 },
                  { name: 'Competitor', icon: Target, earned: stats.totalMatches >= 25 }
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg text-center ${
                      achievement.earned 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <achievement.icon className={`w-8 h-8 mx-auto mb-2 ${
                      achievement.earned ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      achievement.earned ? 'text-green-800' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal/Dialog would go here */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Edit Profile</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProfile;


