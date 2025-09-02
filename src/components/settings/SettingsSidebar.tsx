import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Settings as SettingsIcon,
} from 'lucide-react';

type SettingsTab = 'account' | 'security' | 'notifications' | 'privacy' | 'preferences';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const settingsTabs = [
  {
    id: 'account' as const,
    label: 'Account',
    icon: User,
    description: 'Profile and connected accounts'
  },
  {
    id: 'security' as const,
    label: 'Security',
    icon: Shield,
    description: 'Password and two-factor auth'
  },
  {
    id: 'notifications' as const,
    label: 'Notifications',
    icon: Bell,
    description: 'Email and push preferences'
  },
  {
    id: 'privacy' as const,
    label: 'Privacy',
    icon: Lock,
    description: 'Profile visibility and data'
  },
  {
    id: 'preferences' as const,
    label: 'App Preferences',
    icon: SettingsIcon,
    description: 'Theme and display options'
  },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="space-y-2">
      {/* Mobile: Horizontal scroll tabs */}
      <div className="lg:hidden flex space-x-2 overflow-x-auto pb-2">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-shrink-0 flex items-center space-x-2 px-4 py-2",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Desktop: Vertical navigation */}
      <div className="hidden lg:block space-y-1">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full justify-start p-4 h-auto text-left",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-80 mt-1">{tab.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}