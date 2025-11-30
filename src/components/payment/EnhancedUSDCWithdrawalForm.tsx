import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/store/useAuth';
import { 
  Chain, 
  isValidForChain, 
  getChainHelperText, 
  getNetworkDisplayName,
  ALLOWED_CHAINS, 
  DEFAULT_NETWORK 
} from '@/lib/address-validation';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Send, 
  Info,
  Loader2,
  Shield,
  Zap
} from 'lucide-react';

interface EnhancedUSDCWithdrawalFormProps {
  currentFcBalance: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface WithdrawalStatus {
  payoutId: string | null;
  status: 'idle' | 'submitting' | 'test-pending' | 'test-confirmed' | 'final-pending' | 'completed' | 'failed';
  testTxHash: string | null;
  finalTxHash: string | null;
  errorMessage: string | null;
}

export const EnhancedUSDCWithdrawalForm: React.FC<EnhancedUSDCWithdrawalFormProps> = ({
  currentFcBalance,
  onSuccess,
  onError
}) => {
  const [fcAmount, setFcAmount] = useState<string>('');
  const [chain, setChain] = useState<Chain>(DEFAULT_NETWORK);
  const [usdcAddress, setUsdcAddress] = useState<string>('');
  const [memoTag, setMemoTag] = useState<string>('');
  const [testSendFirst, setTestSendFirst] = useState<boolean>(true);
  const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus>({
    payoutId: null,
    status: 'idle',
    testTxHash: null,
    finalTxHash: null,
    errorMessage: null
  });
  const [addressValid, setAddressValid] = useState<boolean>(false);
  const { user } = useAuth();

  const minWithdrawal = 10;
  const testAmount = 1.00;

  // Validate address when chain or address changes
  useEffect(() => {
    if (usdcAddress && chain) {
      const isValid = isValidForChain(chain, usdcAddress);
      setAddressValid(isValid);
    } else {
      setAddressValid(false);
    }
  }, [usdcAddress, chain]);

  // Calculate fees
  const feeBreakdown = React.useMemo(() => {
    const amount = parseFloat(fcAmount);
    if (amount < minWithdrawal) return null;

    const circleFee = amount * 0.005; // 0.5%
    const networkGas = chain === 'ETHEREUM' ? 3.00 : chain === 'SOLANA' ? 0.01 : 1.00;
    const totalFee = circleFee + networkGas;
    const usdcReceived = amount - totalFee;

    return {
      fcAmount: amount,
      circleFee: parseFloat(circleFee.toFixed(2)),
      networkGas: parseFloat(networkGas.toFixed(2)),
      totalFee: parseFloat(totalFee.toFixed(2)),
      usdcReceived: parseFloat(usdcReceived.toFixed(2))
    };
  }, [fcAmount, chain]);

  const handleWithdraw = async () => {
    const amount = parseFloat(fcAmount);

    // Validation
    if (!user) {
      onError('Please login to withdraw');
      return;
    }

    if (amount < minWithdrawal) {
      onError(`Minimum withdrawal is ${minWithdrawal} FC`);
      return;
    }

    if (amount > currentFcBalance) {
      onError('Insufficient FC balance');
      return;
    }

    if (!addressValid) {
      onError(`Invalid ${getNetworkDisplayName(chain)} address`);
      return;
    }

    setWithdrawalStatus(prev => ({ ...prev, status: 'submitting' }));

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          chain,
          toAddress: usdcAddress,
          amount: amount.toString(),
          memoTag: memoTag || undefined,
          testSendFirst: testSendFirst
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Withdrawal failed');
      }

      const data = await response.json();
      
      setWithdrawalStatus({
        payoutId: data.payoutId,
        status: testSendFirst ? 'test-pending' : 'final-pending',
        testTxHash: null,
        finalTxHash: null,
        errorMessage: null
      });

      if (testSendFirst) {
        toast({
          title: 'Test Withdrawal Sent!',
          description: `$${testAmount} USDC test sent to verify address`,
        });
      } else {
        toast({
          title: 'Withdrawal Initiated!',
          description: `$${amount} USDC sent to your wallet`,
        });
        onSuccess();
      }

    } catch (error: any) {
      setWithdrawalStatus(prev => ({ 
        ...prev, 
        status: 'failed', 
        errorMessage: error.message 
      }));
      onError(error.message || 'Failed to process withdrawal');
    }
  };

  const handleConfirmRemainder = async () => {
    if (!withdrawalStatus.payoutId) return;

    setWithdrawalStatus(prev => ({ ...prev, status: 'submitting' }));

    try {
      const response = await fetch(
        `/api/wallet/withdraw/${withdrawalStatus.payoutId}/confirm-remainder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to confirm remainder');
      }

      setWithdrawalStatus(prev => ({ ...prev, status: 'final-pending' }));
      toast({
        title: 'Remainder Sent!',
        description: 'Final withdrawal amount sent to your wallet',
      });
      onSuccess();

    } catch (error: any) {
      onError(error.message || 'Failed to confirm remainder');
    }
  };

  const getStatusMessage = () => {
    switch (withdrawalStatus.status) {
      case 'test-pending':
        return 'Waiting for test transaction confirmation...';
      case 'test-confirmed':
        return 'Test confirmed! Ready to send remainder.';
      case 'final-pending':
        return 'Final withdrawal processing...';
      case 'completed':
        return 'Withdrawal completed successfully!';
      case 'failed':
        return `Withdrawal failed: ${withdrawalStatus.errorMessage}`;
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (withdrawalStatus.status) {
      case 'test-pending':
      case 'final-pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'test-confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (withdrawalStatus.payoutId && withdrawalStatus.status !== 'idle') {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Withdrawal Status
          </CardTitle>
          <CardDescription>
            Payout ID: {withdrawalStatus.payoutId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={withdrawalStatus.status === 'failed' ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20'}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {getStatusMessage()}
            </AlertDescription>
          </Alert>

          {withdrawalStatus.status === 'test-confirmed' && (
            <Button onClick={handleConfirmRemainder} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Send Remainder (${feeBreakdown ? (feeBreakdown.fcAmount - testAmount).toFixed(2) : '0'})
            </Button>
          )}

          {withdrawalStatus.testTxHash && (
            <div className="text-sm">
              <p className="text-muted-foreground">Test Transaction:</p>
              <a 
                href={`https://etherscan.io/tx/${withdrawalStatus.testTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {withdrawalStatus.finalTxHash && (
            <div className="text-sm">
              <p className="text-muted-foreground">Final Transaction:</p>
              <a 
                href={`https://etherscan.io/tx/${withdrawalStatus.finalTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Withdraw as USDC
        </CardTitle>
        <CardDescription>
          Multi-chain USDC withdrawal with test-first security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Selection */}
        <div className="space-y-2">
          <Label>Network</Label>
          <Select value={chain} onValueChange={(value) => setChain(value as Chain)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALLOWED_CHAINS.map((network) => (
                <SelectItem key={network} value={network}>
                  <div className="flex items-center gap-2">
                    {network === 'POLYGON' && <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">Fast</Badge>}
                    {network === 'SOLANA' && <Badge variant="secondary" className="bg-green-500/20 text-green-600">Ultra Fast</Badge>}
                    {network === 'ETHEREUM' && <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">Standard</Badge>}
                    <span>{getNetworkDisplayName(network)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getChainHelperText(chain)}
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-primary">{currentFcBalance.toFixed(2)} FC</p>
        </div>

        {/* FC Amount */}
        <div className="space-y-2">
          <Label htmlFor="fcAmount">FC Amount to Withdraw</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fcAmount"
              type="number"
              min={minWithdrawal}
              max={currentFcBalance}
              value={fcAmount}
              onChange={(e) => setFcAmount(e.target.value)}
              placeholder="Enter FC amount"
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum: {minWithdrawal} FC • Maximum: {currentFcBalance.toFixed(2)} FC
          </p>
        </div>

        {/* Fee Breakdown */}
        {feeBreakdown && (
          <Alert className="bg-primary/10 border-primary/20">
            <CheckCircle className="h-4 w-4 text-primary" />
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
                    <span>Network Gas ({getNetworkDisplayName(chain)}):</span>
                    <span>-${feeBreakdown.networkGas}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary border-t border-border/50 pt-1 mt-1">
                    <span>You Receive:</span>
                    <span>{feeBreakdown.usdcReceived} USDC</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Destination Address */}
        <div className="space-y-2">
          <Label htmlFor="usdcAddress">
            {getNetworkDisplayName(chain)} Address
            {addressValid && <CheckCircle className="inline h-3 w-3 ml-1 text-green-500" />}
            {usdcAddress && !addressValid && <AlertCircle className="inline h-3 w-3 ml-1 text-red-500" />}
          </Label>
          <Input
            id="usdcAddress"
            type="text"
            placeholder={chain === 'SOLANA' ? 'Base58 address' : '0x...'}
            value={usdcAddress}
            onChange={(e) => setUsdcAddress(e.target.value.trim())}
            className={addressValid ? 'border-green-500' : usdcAddress && !addressValid ? 'border-red-500' : ''}
          />
          {chain === 'SOLANA' && (
            <Input
              placeholder="Memo tag (optional for exchanges)"
              value={memoTag}
              onChange={(e) => setMemoTag(e.target.value)}
              className="text-xs"
            />
          )}
        </div>

        {/* Test Send Option */}
        <div className="flex items-center space-x-2 p-3 bg-blue-500/10 rounded-lg">
          <Checkbox 
            id="testSend"
            checked={testSendFirst}
            onCheckedChange={(checked) => setTestSendFirst(checked as boolean)}
          />
          <Label htmlFor="testSend" className="text-sm">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              Send ${testAmount} test first (recommended for new addresses)
            </div>
          </Label>
        </div>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p><strong>Multi-Chain Support:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Polygon:</strong> Fast & low fees, works with MetaMask</li>
              <li><strong>Solana:</strong> Ultra fast, works with Phantom</li>
              <li><strong>Ethereum:</strong> Standard network, higher fees</li>
            </ul>
            <p className="mt-2">
              <strong>Don't have a wallet?</strong> Create account on Coinbase, Kraken, or Binance and use your USDC deposit address.
            </p>
          </AlertDescription>
        </Alert>

        {/* Action Button */}
        <Button
          onClick={handleWithdraw}
          disabled={
            !fcAmount || 
            parseFloat(fcAmount) < minWithdrawal || 
            parseFloat(fcAmount) > currentFcBalance || 
            !addressValid ||
            withdrawalStatus.status === 'submitting'
          }
          className="w-full"
          size="lg"
        >
          {withdrawalStatus.status === 'submitting' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {testSendFirst ? `Send $${testAmount} Test` : `Withdraw ${feeBreakdown ? `${feeBreakdown.usdcReceived} USDC` : 'FC'}`}
            </>
          )}
        </Button>

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground">
          {testSendFirst 
            ? 'Test will be sent first, then remainder after confirmation'
            : 'Withdrawals are typically processed within 10-30 seconds'
          }
        </p>
      </CardContent>
    </Card>
  );
};


