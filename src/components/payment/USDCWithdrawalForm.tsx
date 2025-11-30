import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useWallet } from '@/store/useWallet';
import { useAuth } from '@/store/useAuth';
import { toast } from '@/hooks/use-toast';

interface USDCWithdrawalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function USDCWithdrawalForm({ onSuccess, onCancel }: USDCWithdrawalFormProps) {
  const [fcAmount, setFcAmount] = useState<number>(0);
  const [usdcAddress, setUsdcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const { balance } = useWallet();
  const { user } = useAuth();

  // Calculate fees when amount changes
  React.useEffect(() => {
    if (fcAmount >= 10) {
      const circleFee = fcAmount * 0.005;
      const networkGas = 2.00;
      const totalFee = circleFee + networkGas;
      const usdcReceived = fcAmount - totalFee;

      setFeeBreakdown({
        fcAmount,
        circleFee: circleFee.toFixed(2),
        networkGas: networkGas.toFixed(2),
        totalFee: totalFee.toFixed(2),
        usdcReceived: usdcReceived.toFixed(2)
      });
    } else {
      setFeeBreakdown(null);
    }
  }, [fcAmount]);

  const handleWithdraw = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to withdraw',
        variant: 'destructive',
      });
      return;
    }

    if (fcAmount < 10) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum withdrawal is 10 FC',
        variant: 'destructive',
      });
      return;
    }

    if (!usdcAddress || !usdcAddress.startsWith('0x')) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid USDC wallet address (starts with 0x)',
        variant: 'destructive',
      });
      return;
    }

    if (fcAmount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have ${balance} FC available`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/wallet/circle/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fcAmount,
          usdcAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }

      const data = await response.json();

      toast({
        title: 'Withdrawal Initiated!',
        description: data.message,
      });

      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Withdraw as USDC
        </CardTitle>
        <CardDescription>
          All withdrawals are processed as USDC cryptocurrency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Alert */}
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            <strong>Regulatory Compliance:</strong> FlockNode withdrawals are processed as USDC cryptocurrency only. You can convert USDC to USD instantly on exchanges like Coinbase, Kraken, or Binance.
          </AlertDescription>
        </Alert>

        {/* Current Balance */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-primary">{balance.toFixed(2)} FC</p>
        </div>

        {/* FC Amount */}
        <div className="space-y-2">
          <Label htmlFor="fcAmount">FC Amount to Withdraw</Label>
          <Input
            id="fcAmount"
            type="number"
            min={10}
            max={balance}
            value={fcAmount || ''}
            onChange={(e) => setFcAmount(parseFloat(e.target.value) || 0)}
            placeholder="Enter FC amount (min 10)"
          />
          <p className="text-xs text-muted-foreground">
            Minimum: 10 FC • Maximum: {balance.toFixed(2)} FC
          </p>
        </div>

        {/* Fee Breakdown */}
        {feeBreakdown && (
          <Alert className="bg-primary/10 border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Withdrawal Breakdown:</p>
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span>FC Amount:</span>
                    <span>{feeBreakdown.fcAmount} FC</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Circle Fee (0.5%):</span>
                    <span>-${feeBreakdown.circleFee}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Network Gas:</span>
                    <span>-${feeBreakdown.networkGas}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary border-t border-border/50 pt-1 mt-1">
                    <span>You Receive:</span>
                    <span>{feeBreakdown.usdcReceived} USDC</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ≈ ${feeBreakdown.usdcReceived} USD (USDC is a 1:1 stablecoin)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* USDC Wallet Address */}
        <div className="space-y-2">
          <Label htmlFor="usdcAddress">Your USDC Wallet Address</Label>
          <Input
            id="usdcAddress"
            type="text"
            placeholder="0x..."
            value={usdcAddress}
            onChange={(e) => setUsdcAddress(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter your Ethereum wallet address (ERC-20 USDC)
          </p>
        </div>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p><strong>Don't have a USDC wallet?</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create account on Coinbase, Kraken, or Binance</li>
              <li>Find your USDC deposit address (Ethereum network)</li>
              <li>Paste address above</li>
              <li>Receive USDC in 10-30 seconds</li>
              <li>Sell USDC for USD instantly on the exchange</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Compliance Notice */}
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-xs">
            <strong>Compliance Notice:</strong> FC tokens are virtual gaming credits. All withdrawals are processed as USDC cryptocurrency for regulatory compliance. FlockNode is not a money transmitter.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleWithdraw}
            disabled={loading || fcAmount < 10 || !usdcAddress || !usdcAddress.startsWith('0x')}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Withdraw {feeBreakdown ? `${feeBreakdown.usdcReceived} USDC` : 'FC'}
              </>
            )}
          </Button>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground">
          Withdrawals are typically processed within 10-30 seconds
        </p>
      </CardContent>
    </Card>
  );
}

