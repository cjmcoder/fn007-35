import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, MessageSquare, Plus, Menu, Home, Target } from "lucide-react";
import { useUI } from "@/store/useUI";
import { WalletBadge } from "@/components/wallet/WalletBadge";
import { useLocation, useNavigate } from "react-router-dom";

export const TopNav = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { setCreateChallengeOpen, setLeftNavOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-card/50 border-b border-border px-3 flex items-center justify-between">
      {/* Left Section - Logo and Navigation */}
      <div className="flex items-center space-x-3">
        {/* FlockNode Logo - Top Left */}
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/89d6cce3-74a3-4deb-aed9-65a543785aa1.png" 
            alt="FlockNode Eagle Logo"
            className="w-7 h-7 object-contain"
          />
          <div className="font-bold gradient-text text-lg">
            FLOCKNODE
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setLeftNavOpen(true)}
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary transition-colors h-8 px-3"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/flocktube')}
            className="flex items-center space-x-2 hover:bg-primary/10 hover:text-primary transition-colors h-8 px-3"
          >
            <span>FlockTube</span>
          </Button>
        </div>
        
        {/* Compact Search */}
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-muted/50 border-border focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Right Section - Compact */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8"
          onClick={() => navigate('/my-profile?tab=mail')}
        >
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-neon-orange text-background text-xs">
            3
          </Badge>
        </Button>

        {/* Messages */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8"
          onClick={() => navigate('/my-profile?tab=mail')}
        >
          <MessageSquare className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-neon-cyan text-background text-xs">
            2
          </Badge>
        </Button>

        {/* Wallet */}
        <WalletBadge />

        {/* Create Challenge - hidden on Lobbies */}
        {!(location.pathname === "/" || location.pathname === "/lobbies") && (
          <Button 
            size="sm"
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-8"
            onClick={() => setCreateChallengeOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        )}
      </div>
    </header>
  );
};