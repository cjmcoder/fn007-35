import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Trophy, 
  Zap, 
  History, 
  Calendar, 
  Settings, 
  Users, 
  Target,
  Gift,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GameSidebar = () => {
  const navigate = useNavigate();
  
  const navigationItems = [
    { icon: Home, label: "MY ARENA", path: "/", active: true },
    { icon: Zap, label: "MY MATCHES", path: "/my-profile?tab=matches", count: 3 },
    { icon: Trophy, label: "MY TOURNAMENTS", path: "/my-tournaments" },
    { icon: Calendar, label: "EVENTS", path: "/events" },
    { icon: Users, label: "LEADERBOARDS", path: "/leaderboards" },
    { icon: Gift, label: "REWARDS", path: "/rewards" },
    { icon: Settings, label: "SETTINGS", path: "/settings" },
    { icon: HelpCircle, label: "SUPPORT", path: "/support" }
  ];

  return (
    <aside className="w-64 h-screen bg-card/50 backdrop-blur-md border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">FLOCKNODE</h1>
            <p className="text-xs text-muted-foreground">Skill-Based Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <Button
            key={index}
            variant={item.active ? "default" : "ghost"}
            className={`w-full justify-start h-12 ${
              item.active 
                ? "bg-gradient-primary text-background shadow-glow" 
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.label}</span>
            {item.count && (
              <Badge className="ml-auto bg-destructive text-destructive-foreground">
                {item.count}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Stats Section */}
      <div className="p-4 border-t border-border">
        <div className="glass p-4 rounded-lg space-y-3">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Lifetime Earnings</div>
            <div className="text-lg font-bold text-neon-cyan">$2,450.00</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Wins</div>
              <div className="text-sm font-bold text-neon-orange">127</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Streak</div>
              <div className="text-sm font-bold text-neon-purple">8</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 FLOCKNODE</p>
          <p className="text-neon-cyan">Skill Gaming Pioneer Since 2024</p>
        </div>
      </div>
    </aside>
  );
};

export default GameSidebar;