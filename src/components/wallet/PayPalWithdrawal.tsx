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

interface WithdrawalRequest {
  requestId: string;
  fcAmount: number;
  userReceives: number;
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

export default function PayPalWithdrawal() {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<WithdrawalRequest | null>(null);
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
    setRequest(null);
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
      const response = await fetch('/api/v1/payments/paypal/withdrawal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fcAmount: parseFloat(amount) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create withdrawal request');
      }

      const data = await response.json();
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fees');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!request) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/payments/paypal/withdrawal/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.requestId,
          fcAmount: request.fcAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process withdrawal');
      }

      const result = await response.json();
      alert(`Withdrawal successful! Transaction ID: ${result.transactionId}`);
      
      // Reset form
      setAmount('');
      setRequest(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayPal Withdrawal
        </CardTitle>
        <CardDescription>
          Withdraw funds from your FLOCKNODE wallet via PayPal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feeStructure && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <div>PayPal Fee: {feeStructure.paypal.percentage * 100}% + ${feeStructure.paypal.fixed}</div>
                <div>Minimum Withdrawal: {feeStructure.minimums.withdrawal} FC</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Withdrawal Amount (FC)
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min={feeStructure?.minimums.withdrawal || 0.32}
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

        {request && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Fee Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FC Amount:</span>
                <span className="font-medium">{request.fcAmount.toFixed(2)} FC</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PayPal Fee ({request.feeBreakdown.percentageFee.toFixed(2)}%):</span>
                <span>${request.feeBreakdown.percentageFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fixed Fee:</span>
                <span>${request.feeBreakdown.fixedFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Fees:</span>
                <span>${request.feeBreakdown.paypalFee.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>You Receive:</span>
                <span>${request.userReceives.toFixed(2)}</span>
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
            onClick={handleWithdrawal}
            disabled={loading || !request}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


