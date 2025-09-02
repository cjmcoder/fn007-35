import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUI } from "@/store/useUI";
import { DepositModal } from "@/components/modals/DepositModal";
import { WithdrawalModal } from "@/components/modals/WithdrawalModal";
import { FNCWalletModal } from "@/components/modals/FNCWalletModal";
import { 
  Plus, 
  DollarSign, 
  Wallet,
  Gamepad2,
  Calendar,
  Video,
  BarChart3
} from "lucide-react";

export const QuickActions = () => {
  const { setCreateChallengeOpen } = useUI();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [fncWalletModalOpen, setFncWalletModalOpen] = useState(false);

  return (
    <>
      <Card className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 p-2 lg:p-3 bg-card/95 backdrop-blur-md border-border/50 shadow-lg z-40">
        <div className="flex flex-col gap-1 lg:gap-2">
          <div className="text-xs text-muted-foreground font-medium text-center mb-1 hidden lg:block">
            Quick Actions
          </div>
          
          {/* Add FC Button */}
          <Button 
            size="sm" 
            onClick={() => setDepositModalOpen(true)}
            className="bg-gradient-primary shadow-glow text-xs lg:text-sm px-2 lg:px-4 border border-primary/30"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Add FC</span>
            <span className="sm:hidden">FC</span>
          </Button>
          
          {/* Cash Out Button */}
          <Button 
            size="sm" 
            onClick={() => setWithdrawalModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg border border-green-500/30 text-xs lg:text-sm px-2 lg:px-4"
          >
            <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Cash Out</span>
            <span className="sm:hidden">Cash</span>
          </Button>
          
          {/* Enable FNC Wallet Button */}
          <Button 
            size="sm" 
            onClick={() => setFncWalletModalOpen(true)}
            variant="outline" 
            className="border-accent/50 text-accent hover:bg-accent/10 text-xs lg:text-sm px-2 lg:px-4"
          >
            <Wallet className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Enable FNC Wallet</span>
            <span className="sm:hidden">FNC</span>
          </Button>
          
          {/* Existing Actions */}
          <Button 
            size="sm" 
            onClick={() => setCreateChallengeOpen(true)}
            variant="outline"
            className="text-xs lg:text-sm px-2 lg:px-4"
          >
            <Gamepad2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Create Match</span>
            <span className="sm:hidden">Match</span>
          </Button>
          
          <Button size="sm" variant="outline" className="text-xs lg:text-sm px-2 lg:px-4">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Join Tournament</span>
            <span className="sm:hidden">Tournament</span>
          </Button>
          
          <Button size="sm" variant="secondary" className="text-xs lg:text-sm px-2 lg:px-4">
            <Video className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Start Stream</span>
            <span className="sm:hidden">Stream</span>
          </Button>
          
          <Button size="sm" variant="ghost" className="text-xs lg:text-sm px-2 lg:px-4">
            <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Leaderboard</span>
            <span className="sm:hidden">Stats</span>
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
      <WithdrawalModal open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen} />
      <FNCWalletModal open={fncWalletModalOpen} onOpenChange={setFncWalletModalOpen} />
    </>
  );
};