import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Monitor, X } from 'lucide-react';

const activeSessions = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'New York, NY',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'New York, NY',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: '3',
    device: 'Chrome on Android',
    location: 'Los Angeles, CA',
    lastActive: '2 days ago',
    current: false
  }
];

export function SecuritySettings() {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: "Session revoked",
      description: "The device has been signed out successfully.",
    });
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA disabled" : "2FA enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled." 
        : "Two-factor authentication has been enabled.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Security</h2>
        <p className="text-muted-foreground">Manage your password and security settings</p>
      </div>

      {/* Change Password */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <Button onClick={handlePasswordChange} className="bg-primary hover:bg-primary/90">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Authenticator App</div>
              <div className="text-sm text-muted-foreground">
                Use an authenticator app to generate verification codes
              </div>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleEnable2FA}
            />
          </div>
          
          {twoFactorEnabled && (
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Setup Instructions</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside ml-4">
                <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code or enter the setup key</li>
                <li>Enter the 6-digit code to verify</li>
              </ol>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Show QR Code</Button>
                <Button variant="outline" size="sm">Show Recovery Codes</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices that are currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium flex items-center space-x-2">
                      <span>{session.device}</span>
                      {session.current && <Badge variant="secondary" className="bg-primary/20 text-primary">Current</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out this device and require a new login. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                          Revoke
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>Get notified about important security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">Email Security Alerts</div>
              <div className="text-sm text-muted-foreground">
                Receive emails about login attempts and account changes
              </div>
            </div>
            <Switch 
              checked={securityAlerts} 
              onCheckedChange={setSecurityAlerts}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}