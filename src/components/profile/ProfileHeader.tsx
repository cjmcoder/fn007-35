import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWallet } from "@/store/useWallet";
import { formatFC } from "@/lib/fncMath";
import { CheckCircle, Twitch, Youtube, MessageCircle, Wallet, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  name?: string;
  region?: string;
  preferredGame?: string;
  wins?: number;
  losses?: number;
  limit?: string;
  verified?: boolean;
  linkedAccounts?: {
    twitch?: boolean;
    youtube?: boolean;
    discord?: boolean;
    wallet?: boolean;
  };
  trustScore?: number;
}

export const ProfileHeader = ({
  name = "Goosegonewild3x",
  region = "North America",
  preferredGame = "Madden NFL 25 PS5 XBX/S PC", 
  wins = 0,
  losses = 0,
  limit = "$25",
  verified = true,
  linkedAccounts = { twitch: true, youtube: false, discord: true, wallet: true },
  trustScore = 85
}: ProfileHeaderProps) => {
  const { wallet } = useWallet();
  const [showFNCInUSD, setShowFNCInUSD] = useState(false);
  
  // Mock FNC balance and conversion rate
  const fncBalance = 2450;
  const fncToUSDRate = 0.024; // $0.024 per FNC
  const fncUSDValue = fncBalance * fncToUSDRate;

  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <TooltipProvider>
      <Card className="gaming-card p-4 lg:p-6 border-2 border-primary/30">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Avatar and User Info */}
          <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6 flex-1">
            <Avatar className="size-16 lg:size-20 border-2 border-primary/40 flex-shrink-0 mx-auto sm:mx-0">
              <AvatarImage alt="Player avatar" src="/placeholder.svg" />
              <AvatarFallback className="bg-muted text-lg lg:text-xl font-bold">
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-4 flex-1 text-center sm:text-left">
              {/* Name and Verification */}
              <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
                <h1 className="text-xl lg:text-2xl font-bold gradient-text">{name}</h1>
                {verified && (
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ID Verified Player</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {/* User Details */}
              <div className="space-y-1">
                <p className="text-sm lg:text-base text-muted-foreground">
                  {region} • Preferred Game:
                </p>
                <p className="text-sm lg:text-base text-muted-foreground font-medium break-words">
                  {preferredGame}
                </p>
              </div>
              
              {/* User Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground mb-1">Last Login:</div>
                  <div className="text-sm font-semibold">8/12/25</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground mb-1">Member Since:</div>
                  <div className="text-sm font-semibold">4/21/25</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs text-muted-foreground mb-1">Trust Score:</div>
                  <div className={`text-sm font-bold ${
                    trustScore >= 80 ? 'text-primary' : 
                    trustScore >= 60 ? 'text-yellow-400' : 'text-destructive'
                  }`}>
                    {trustScore}/100
                  </div>
                </div>
              </div>
              
              {/* Linked Accounts */}
              <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
                <span className="text-xs text-muted-foreground">Linked:</span>
                <div className="flex gap-2">
                  {linkedAccounts.twitch && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="p-2 rounded bg-purple-500/20">
                          <Twitch className="w-4 h-4 text-purple-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>Twitch Connected</p></TooltipContent>
                    </Tooltip>
                  )}
                  {linkedAccounts.discord && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="p-2 rounded bg-indigo-500/20">
                          <MessageCircle className="w-4 h-4 text-indigo-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>Discord Connected</p></TooltipContent>
                    </Tooltip>
                  )}
                  {linkedAccounts.wallet && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="p-2 rounded bg-primary/20">
                          <Wallet className="w-4 h-4 text-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent><p>Wallet Connected</p></TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Performance Stats and Balance Cards */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            {/* Performance Stats */}
            <div className="text-center">
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">WINS</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">LOSSES</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">WIN RATE</div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{wins}</div>
                <div className="text-3xl lg:text-4xl font-bold text-destructive">{losses}</div>
                <div className="text-3xl lg:text-4xl font-bold">{winRate}%</div>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              {/* FC Balance */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center p-4 rounded-lg bg-primary/15 border border-primary/30 min-w-[120px]">
                    <div className="text-xs text-primary/80 uppercase font-medium mb-2 tracking-wide">FC BALANCE</div>
                    <div className="font-mono text-xl lg:text-2xl font-bold text-primary mb-1">
                      {formatFC(wallet.fc).replace(' FC', '')}
                    </div>
                    <div className="text-xs font-semibold text-primary mb-1">FC</div>
                    <div className="text-xs text-muted-foreground">Cash Equivalent</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>FC = Cash equivalent currency</p>
                </TooltipContent>
              </Tooltip>

              {/* FNC Balance */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-center p-4 rounded-lg bg-secondary/15 border border-secondary/30 min-w-[120px] relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-1 right-1 h-5 w-5 p-0 opacity-60 hover:opacity-100"
                      onClick={() => setShowFNCInUSD(!showFNCInUSD)}
                    >
                      {showFNCInUSD ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    
                    <div className="text-xs text-secondary/80 uppercase font-medium mb-2 tracking-wide">FNC BALANCE</div>
                    <div className="font-mono text-xl lg:text-2xl font-bold text-secondary mb-1">
                      {showFNCInUSD 
                        ? fncUSDValue.toFixed(0)
                        : fncBalance.toLocaleString().replace(',', ',')}
                    </div>
                    <div className="text-xs font-semibold text-secondary mb-1">
                      {showFNCInUSD ? 'USD' : 'FNC'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {showFNCInUSD ? 'Est. Value' : 'Speculative Token'}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>FNC = Speculative crypto token</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};