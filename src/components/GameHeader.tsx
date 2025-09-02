import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, User, Zap, Trophy, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GameHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full glass-card border-b border-neon-cyan/30 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">FLOCKNODE</h1>
            <p className="text-xs text-muted-foreground">Skill-Based Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="neon-text hover:bg-primary/10">
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </Button>
          <Button variant="ghost" className="neon-text hover:bg-primary/10">
            <Zap className="w-4 h-4 mr-2" />
            Challenges
          </Button>
          <Button variant="ghost" className="neon-text hover:bg-primary/10" onClick={() => navigate('/flocktube')} aria-label="Go to FlockTube">
            FlockTube
          </Button>
          <Button variant="ghost" className="neon-text hover:bg-primary/10" onClick={() => navigate('/leaderboards')} aria-label="Go to Leaderboards">
            Leaderboards
          </Button>
          <Button variant="ghost" className="neon-text hover:bg-primary/10">
            My Profile
          </Button>
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players..."
              className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative neon-border pulse-neon">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-destructive text-xs">3</Badge>
          </Button>

          {/* User Balance */}
          <div className="glass px-3 py-2 rounded-lg">
            <span className="text-sm text-neon-cyan font-mono">$1,250.00</span>
          </div>

          {/* User Avatar */}
          <Button variant="ghost" size="icon" className="neon-border">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;