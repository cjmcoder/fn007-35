import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Info } from 'lucide-react';

interface FeeBreakdown {
  paypalFee: number;
  percentageFee: number;
  fixedFee: number;
}

interface DepositSession {
  sessionId: string;
  userPays: number;
  fcReceived: number;
  feeBreakdown: FeeBreakdown;
  minimumAmount: number;
}

interface FeeStructure {
  paypal: {
    percentage: number;
    fixed: number;
    description: string;
  };
  match: {
    percentage: number;
    description: string;
  };
  propVig: {
    percentage: number;
    description: string;
  };
  minimums: {
    deposit: number;
    withdrawal: number;
  };
}

export default function PayPalDeposit() {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<DepositSession | null>(null);
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [error, setError] = useState<string>('');

  // Load fee structure on component mount
  useEffect(() => {
    const loadFeeStructure = async () => {
      try {
        const response = await fetch('/api/v1/payments/paypal/fees/structure');
        if (response.ok) {
          const data = await response.json();
          setFeeStructure(data);
        }
      } catch (err) {
        console.error('Failed to load fee structure:', err);
      }
    };

    loadFeeStructure();
  }, []);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSession(null);
    setError('');
  };

  const calculateFees = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/payments/paypal/deposit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create deposit session');
      }

      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/payments/paypal/deposit/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          amount: session.userPays,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process deposit');
      }

      const result = await response.json();
      alert(`Deposit successful! Transaction ID: ${result.transactionId}`);
      
      // Reset form
      setAmount('');
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayPal Deposit
        </CardTitle>
        <CardDescription>
          Add funds to your FLOCKNODE wallet via PayPal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeStructure && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <div>PayPal Fee: {feeStructure.paypal.percentage * 100}% + ${feeStructure.paypal.fixed}</div>
                <div>Minimum Deposit: ${feeStructure.minimums.deposit}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Deposit Amount (USD)
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min={feeStructure?.minimums.deposit || 0.32}
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={calculateFees}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {session && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Fee Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>You Pay:</span>
                <span className="font-medium">${session.userPays.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PayPal Fee ({session.feeBreakdown.percentageFee.toFixed(2)}%):</span>
                <span>${session.feeBreakdown.percentageFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fixed Fee:</span>
                <span>${session.feeBreakdown.fixedFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Fees:</span>
                <span>${session.feeBreakdown.paypalFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>FC Received:</span>
                <span>{session.fcReceived.toFixed(2)} FC</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={calculateFees}
            disabled={loading || !amount}
            variant="outline"
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calculate Fees'}
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={loading || !session}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


