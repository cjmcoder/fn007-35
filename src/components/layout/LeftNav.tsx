import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Swords, 
  Trophy, 
  Calendar, 
  Crown, 
  Gift, 
  HelpCircle,
  Video,
  X,
  Monitor,
  Target
} from "lucide-react";
import { useUI } from "@/store/useUI";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  { icon: Home, label: "My Arena", path: "/", active: true },
  { icon: Swords, label: "My Profile", path: "/my-profile", badge: "2" },
  { icon: Target, label: "Skill Props", path: "/props", badge: "LIVE" },
  { icon: Video, label: "My Stream", path: "/my-stream" },
  { icon: Monitor, label: "FlockTube", path: "/flocktube", badge: "LIVE" },
  { icon: Trophy, label: "My Tournaments", path: "/my-tournaments" },
  { icon: Calendar, label: "Events", path: "/events", badge: "NEW" },
  { icon: Crown, label: "Leaderboards", path: "/leaderboards" },
  { icon: Gift, label: "Rewards", path: "/rewards", badge: "3" },
  { icon: HelpCircle, label: "Support", path: "/support" },
];

export const LeftNav = () => {
  const { leftNavOpen, setLeftNavOpen } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {leftNavOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setLeftNavOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-card/30 backdrop-blur-md border-r border-border flex flex-col transition-transform duration-300 overflow-y-auto",
        leftNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="font-bold gradient-text text-xl">
              FLOCKNODE
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setLeftNavOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Elite Gaming Hub</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-11 px-4",
                  isActive && "bg-primary/20 text-primary border border-primary/30"
                )}
                onClick={() => {
                  navigate(item.path);
                  setLeftNavOpen(false); // Close mobile nav on selection
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    className={cn(
                      "ml-auto text-xs",
                      item.badge === "NEW" ? "bg-neon-orange/20 text-neon-orange border-neon-orange/30" :
                      "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Stats */}
        <div className="p-4 border-t border-border">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lifetime Earnings</span>
              <span className="font-mono font-bold text-neon-cyan">12,450 FC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="font-bold">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                5 Win
              </Badge>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};