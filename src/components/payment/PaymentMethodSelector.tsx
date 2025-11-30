import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, DollarSign as PayPalIcon, Coins, CheckCircle, Info } from 'lucide-react';
import { StripeDepositForm } from './StripeDepositForm';
import { USDCWithdrawalForm } from './USDCWithdrawalForm';

interface PaymentMethodSelectorProps {
  mode: 'deposit' | 'withdrawal';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentMethodSelector({ mode, onSuccess, onCancel }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/wallet/payment-methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment methods...</div>;
  }

  if (selectedMethod === 'stripe' && mode === 'deposit') {
    return <StripeDepositForm onSuccess={onSuccess} onCancel={() => setSelectedMethod(null)} />;
  }

  if (mode === 'withdrawal') {
    return <USDCWithdrawalForm onSuccess={onSuccess} onCancel={onCancel} />;
  }

  const methods = mode === 'deposit' ? paymentMethods?.depositMethods : paymentMethods?.withdrawalMethods;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {mode === 'deposit' ? 'Select Deposit Method' : 'Withdrawal Method'}
        </h3>
        {mode === 'deposit' && paymentMethods?.complianceNote && (
          <Alert className="mb-4 bg-blue-500/10 border-blue-500/20">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs">
              {paymentMethods.complianceNote}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* STRIPE */}
        {methods?.stripe?.enabled && (
          <Card
            className="cursor-pointer hover:border-primary/50 transition-all border-2"
            onClick={() => setSelectedMethod('stripe')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{methods.stripe.name}</CardTitle>
                    <CardDescription className="text-xs">{methods.stripe.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Instant</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">{methods.stripe.fee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{methods.stripe.depositTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PAYPAL */}
        {methods?.paypal?.enabled && (
          <Card
            className="cursor-pointer hover:border-primary/50 transition-all border-2"
            onClick={() => toast({ title: 'Coming Soon', description: 'PayPal integration in progress' })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <PayPalIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{methods.paypal.name}</CardTitle>
                    <CardDescription className="text-xs">{methods.paypal.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Instant</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">{methods.paypal.fee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{methods.paypal.depositTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CIRCLE (USDC) */}
        {methods?.circle?.enabled && (
          <Card
            className="cursor-pointer hover:border-primary/50 transition-all border-2 border-green-500/30"
            onClick={() => mode === 'deposit' 
              ? toast({ title: 'Coming Soon', description: 'USDC deposits in progress' })
              : null
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Coins className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {methods.circle.name}
                      <Badge variant="outline" className="border-green-500/30 text-green-500 text-xs">
                        Lowest Fees
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">{methods.circle.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">30 sec</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium text-green-500">{methods.circle.fee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{mode === 'deposit' ? methods.circle.depositTime : methods.circle.withdrawalTime}</p>
                </div>
              </div>
              {mode === 'withdrawal' && (
                <div className="mt-2">
                  <Badge variant="outline" className="border-green-500/30 text-green-500 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Only Withdrawal Option
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {mode === 'withdrawal' && (
        <Alert className="mt-4 bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-xs">
            <strong>Why USDC only?</strong> To maintain regulatory compliance and avoid money transmitter licensing, all withdrawals are processed as cryptocurrency. USDC is a stablecoin (1 USDC = $1 USD) and can be instantly converted to USD on major exchanges.
          </AlertDescription>
        </Alert>
      )}

      {onCancel && (
        <Button onClick={onCancel} variant="outline" className="w-full mt-4">
          Cancel
        </Button>
      )}
    </div>
  );
}

