import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wallet, Shield, Info } from "lucide-react";

interface FNCWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FNCWalletModal = ({ open, onOpenChange }: FNCWalletModalProps) => {
  const [step, setStep] = useState(1);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleWalletConnection = (type: string) => {
    setWalletType(type);
    // Simulate wallet connection
    setTimeout(() => {
      setWalletConnected(true);
      setStep(3);
    }, 2000);
  };

  const handleFinish = () => {
    onOpenChange(false);
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setWalletType(null);
      setWalletConnected(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">Enable Your FNC Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <>
              {/* Step 1: Explanation */}
              <Card className="p-4 bg-accent/10 border-accent/30">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-accent mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-accent">About FNC Tokens</h3>
                    <p className="text-sm text-muted-foreground">
                      FNC is a speculative crypto reward earned through performance. 
                      Token value is not guaranteed and may fluctuate.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      FNC may be bridged on-chain in the future, enabling trading 
                      and additional utility within the FLOCKNODE ecosystem.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Setting up a wallet will prepare you for future FNC features.
                </p>
                <Button 
                  onClick={() => setStep(2)}
                  className="bg-gradient-primary hover:opacity-80"
                >
                  Continue Setup
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Step 2: Choose Wallet Type */}
              <div className="space-y-4">
                <h3 className="font-medium text-center">Choose Your Wallet Type</h3>
                
                <div className="space-y-3">
                  <Card 
                    className="p-4 cursor-pointer border-2 transition-all hover:border-primary/50"
                    onClick={() => handleWalletConnection('embedded')}
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">Create Embedded Wallet</h4>
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Secure, managed wallet built into your account. 
                          No external app needed.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    className="p-4 cursor-pointer border-2 transition-all hover:border-primary/50"
                    onClick={() => handleWalletConnection('metamask')}
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-8 h-8 text-neon-orange" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Connect MetaMask</h4>
                        <p className="text-sm text-muted-foreground">
                          Use your existing MetaMask wallet for FNC management.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="text-sm"
                  >
                    ← Back
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Step 3: Success */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Wallet Setup Complete!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your {walletType === 'embedded' ? 'embedded' : 'MetaMask'} wallet is now connected.
                  </p>
                </div>

                <Card className="p-3 bg-muted/30">
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Wallet Status:</p>
                    <p className="font-medium text-primary">
                      Wallet Connected: {walletType === 'embedded' ? '0x1234...5678' : 'MetaMask Connected'}
                    </p>
                  </div>
                </Card>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    🔹 FNC is earned through performance rewards
                  </p>
                  <p>
                    🔹 May be bridged on-chain later for trading/utility
                  </p>
                  <p>
                    🔹 Token value is speculative and not guaranteed
                  </p>
                </div>

                <Button 
                  onClick={handleFinish}
                  className="w-full bg-gradient-primary hover:opacity-80"
                >
                  Finish Setup
                </Button>
              </div>
            </>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full transition-all ${
                  step >= stepNum ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};