import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';

export function PrivacySettings() {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    matchHistoryVisible: true,
    streamLinkVisible: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    showInLeaderboards: true
  });

  const handleSave = () => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleDataDownload = () => {
    toast({
      title: "Data export requested",
      description: "We'll email you a download link within 24 hours.",
    });
  };

  const handleAccountDeletion = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted. This process may take up to 7 days.",
      variant: "destructive"
    });
  };

  const updateSetting = (key: string, value: boolean | string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Privacy</h2>
        <p className="text-muted-foreground">Control your profile visibility and data sharing</p>
      </div>

      {/* Profile Visibility */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Profile Visibility</span>
          </CardTitle>
          <CardDescription>Control who can see your profile and activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Visibility</label>
            <Select 
              value={privacySettings.profileVisibility} 
              onValueChange={(value) => updateSetting('profileVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                <SelectItem value="friends">Friends Only - Only connected friends can view</SelectItem>
                <SelectItem value="private">Private - Profile is hidden from search</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Show Match History</div>
              <div className="text-sm text-muted-foreground">Allow others to see your game results and statistics</div>
            </div>
            <Switch 
              checked={privacySettings.matchHistoryVisible} 
              onCheckedChange={(value) => updateSetting('matchHistoryVisible', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Show Stream Links</div>
              <div className="text-sm text-muted-foreground">Display your Twitch/YouTube links on your profile</div>
            </div>
            <Switch 
              checked={privacySettings.streamLinkVisible} 
              onCheckedChange={(value) => updateSetting('streamLinkVisible', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Show Online Status</div>
              <div className="text-sm text-muted-foreground">Let others see when you're online</div>
            </div>
            <Switch 
              checked={privacySettings.showOnlineStatus} 
              onCheckedChange={(value) => updateSetting('showOnlineStatus', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Communication</CardTitle>
          <CardDescription>Manage how others can contact you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Allow Direct Messages</div>
              <div className="text-sm text-muted-foreground">Let other players send you private messages</div>
            </div>
            <Switch 
              checked={privacySettings.allowDirectMessages} 
              onCheckedChange={(value) => updateSetting('allowDirectMessages', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Show in Leaderboards</div>
              <div className="text-sm text-muted-foreground">Include your profile in public ranking lists</div>
            </div>
            <Switch 
              checked={privacySettings.showInLeaderboards} 
              onCheckedChange={(value) => updateSetting('showInLeaderboards', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Request your data or manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">Download Your Data</div>
              <div className="text-sm text-muted-foreground">
                Get a copy of all your account data, including profile info, match history, and messages
              </div>
            </div>
            <Button variant="outline" onClick={handleDataDownload}>
              <Download className="h-4 w-4 mr-2" />
              Request Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex-1">
              <div className="font-medium text-destructive flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Delete Account</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure you want to delete your account? This will:
                    <br />• Permanently delete your profile and all data
                    <br />• Remove you from all tournaments and challenges
                    <br />• Forfeit any remaining FC balance
                    <br />• Cannot be undone or recovered
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccountDeletion}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Notice */}
      <Card className="gaming-card border-primary/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Your Privacy Rights:</strong> You have the right to access, update, or delete your personal data at any time. We comply with GDPR and other privacy regulations.
            </p>
            <p>
              For questions about our privacy practices, please contact our support team or review our Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          Save Privacy Settings
        </Button>
      </div>
    </div>
  );
}