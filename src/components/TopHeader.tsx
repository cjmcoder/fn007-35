import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, User, MessageCircle, Home, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const TopHeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <header className="h-16 bg-card/30 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      {/* Left Section - Branding & Navigation */}
      <div className="flex items-center space-x-8">
        {/* FlockNode Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src="/placeholder.svg" 
            alt="FlockNode Eagle Logo"
            className="w-8 h-8 object-contain"
          />
          <div className="font-bold gradient-text text-lg">
            FLOCKNODE
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary transition-colors">
            <a href="/">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </a>
          </Button>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  toast({
                    title: "Search Feature",
                    description: `Searching for "${searchQuery}"...`,
                  });
                }
              }}
              className="pl-10 pr-4 py-2 w-64 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Section - User & Actions */}
      <div className="flex items-center space-x-4">
        {/* Live Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-muted/30 rounded-lg">
          <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            <span className="text-neon-cyan">Live:</span> 7:10 pm CST
          </span>
        </div>

        {/* Notifications & Messages */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
            onClick={() => {
              toast({
                title: "Notifications",
                description: "You have 5 new notifications",
              });
              navigate('/my-profile?tab=mail');
            }}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-destructive text-xs">5</Badge>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
            onClick={() => {
              toast({
                title: "Messages",
                description: "You have 2 new messages",
              });
              navigate('/my-profile?tab=mail');
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-neon-cyan text-background text-xs">2</Badge>
          </Button>
        </div>

        {/* User Balance */}
        <div className="glass px-4 py-2 rounded-lg">
          <span className="text-sm text-neon-cyan font-mono">$1,250.00</span>
          <span className="text-xs text-muted-foreground ml-2">0 rewards</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="neon-border h-9 w-9"
            onClick={() => navigate('/my-profile')}
          >
            <User className="w-5 h-5" />
          </Button>
          <span 
            className="text-sm font-medium hidden lg:inline cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate('/my-profile')}
          >
            Goosegonewild3x
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;