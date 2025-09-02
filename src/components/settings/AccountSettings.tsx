import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link2, Unlink2 } from 'lucide-react';

const connectedAccounts = [
  { platform: 'PlayStation', username: 'FlockEagle25', connected: true },
  { platform: 'Xbox Live', username: 'FlockEagle25', connected: true },
  { platform: 'Steam', username: '', connected: false },
  { platform: 'Twitch', username: 'flockeagle_tv', connected: true },
  { platform: 'YouTube', username: '', connected: false },
];

export function AccountSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: 'FlockEagle',
    displayName: 'The Flock Eagle',
    email: 'eagle@flocknode.com',
    bio: 'Competitive gamer focused on skill-based challenges. Always looking for the next big tournament!',
    region: 'us-east',
    timezone: 'America/New_York',
    psnId: 'FlockEagle25',
    xboxId: 'FlockEagle25',
    steamId: '',
    twitchId: 'flockeagle_tv',
  });

  const handleSave = () => {
    toast({
      title: "Account updated",
      description: "Your account settings have been saved successfully.",
    });
  };

  const handleConnect = (platform: string) => {
    toast({
      title: `${platform} connected`,
      description: `Your ${platform} account has been linked successfully.`,
    });
  };

  const handleDisconnect = (platform: string) => {
    toast({
      title: `${platform} disconnected`,
      description: `Your ${platform} account has been unlinked.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Account</h2>
        <p className="text-muted-foreground">Manage your profile and connected accounts</p>
      </div>

      {/* Profile Information */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your avatar, username, and basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">FE</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button variant="outline" size="sm" className="mb-2">
                <Upload className="h-4 w-4 mr-2" />
                Upload new avatar
              </Button>
              <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east">US East</SelectItem>
                  <SelectItem value="us-west">US West</SelectItem>
                  <SelectItem value="eu-west">EU West</SelectItem>
                  <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Link your gaming and streaming accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.platform} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="font-medium">{account.platform}</div>
                    {account.connected ? (
                      <div className="text-sm text-muted-foreground">{account.username}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Not connected</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {account.connected ? (
                    <>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">Connected</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(account.platform)}
                      >
                        <Unlink2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConnect(account.platform)}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Changes
        </Button>
      </div>
    </div>
  );
}