import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to MyProfile with account tab after a short delay
    const timer = setTimeout(() => {
      navigate('/my-profile?tab=account');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="gaming-card max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Settings Moved</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              All settings are now available in your profile for a better experience.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be redirected automatically, or click below to go now.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/my-profile?tab=account')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Go to My Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}