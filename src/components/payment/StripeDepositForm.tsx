import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '@/store/useWallet';
import { toast } from '@/hooks/use-toast';

// Stripe publishable key will be fetched from API
let stripePromise: Promise<any> | null = null;

interface StripeDepositFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Checkout form component
function CheckoutForm({ fcAmount, onSuccess }: { fcAmount: number; onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateBalance } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/wallet?payment=success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: submitError.message,
          variant: 'destructive',
        });
      } else {
        // Payment succeeded
        toast({
          title: 'Deposit Successful!',
          description: `${fcAmount} FC has been added to your wallet`,
        });
        
        // Update wallet balance
        await updateBalance();
        
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Secure payment powered by Stripe
      </p>
    </form>
  );
}

// Main deposit form
export function StripeDepositForm({ onSuccess, onCancel }: StripeDepositFormProps) {
  const [fcAmount, setFcAmount] = useState<number>(100);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = async () => {
    if (fcAmount < 5 || fcAmount > 10000) {
      toast({
        title: 'Invalid Amount',
        description: 'FC amount must be between 5 and 10,000',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/wallet/stripe/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fcAmount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }

      const data = await response.json();
      
      setClientSecret(data.clientSecret);
      setPublishableKey(data.publishableKey);
      setFeeBreakdown({
        fcAmount: data.fcAmount,
        processorFee: data.processorFee,
        totalCharged: data.totalCharged,
        breakdown: data.breakdown,
      });

      // Initialize Stripe
      if (!stripePromise) {
        stripePromise = loadStripe(data.publishableKey);
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#10b981',
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
      },
    },
  } : null;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Deposit with Card
        </CardTitle>
        <CardDescription>
          Add FC tokens to your wallet using credit or debit card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!clientSecret ? (
          <>
            {/* Amount selection */}
            <div className="space-y-2">
              <Label htmlFor="fcAmount">FC Amount</Label>
              <Input
                id="fcAmount"
                type="number"
                min={5}
                max={10000}
                value={fcAmount}
                onChange={(e) => setFcAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter FC amount"
              />
              <p className="text-sm text-muted-foreground">
                Minimum: 5 FC • Maximum: 10,000 FC
              </p>
            </div>

            {/* Fee preview */}
            {fcAmount >= 5 && (
              <Alert className="bg-primary/10 border-primary/20">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Payment Breakdown:</p>
                    <p className="text-sm">
                      FC Tokens: ${fcAmount.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      Processor Fee: ${((fcAmount * 0.029) + 0.30).toFixed(2)}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      Total Charged: ${(fcAmount + (fcAmount * 0.029) + 0.30).toFixed(2)}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Compliance notice */}
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs">
                <strong>Important:</strong> FC tokens are virtual gaming credits. Withdrawals are processed as USDC cryptocurrency only. You may convert USDC to USD on external exchanges.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={createPaymentIntent} 
              disabled={loading || fcAmount < 5} 
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                `Continue to Payment`
              )}
            </Button>

            {onCancel && (
              <Button onClick={onCancel} variant="outline" className="w-full">
                Cancel
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Stripe payment form */}
            {feeBreakdown && (
              <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                <p className="font-medium">Payment Summary:</p>
                <div className="flex justify-between">
                  <span>FC Tokens:</span>
                  <span>{feeBreakdown.fcAmount} FC</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processor Fee:</span>
                  <span>${feeBreakdown.processorFee}</span>
                </div>
                <div className="flex justify-between font-bold text-primary border-t border-border/50 pt-1 mt-1">
                  <span>Total Charged:</span>
                  <span>${feeBreakdown.totalCharged}</span>
                </div>
              </div>
            )}

            {stripePromise && stripeOptions && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm fcAmount={fcAmount} onSuccess={onSuccess} />
              </Elements>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

