import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Trash2, Download, Shield, Wallet } from 'lucide-react';

const paymentMethods = [
  {
    id: '1',
    type: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    default: true
  },
  {
    id: '2',
    type: 'Mastercard',
    last4: '8888',
    expiryMonth: '06',
    expiryYear: '2026',
    default: false
  }
];

const transactions = [
  {
    id: 'tx_001',
    date: '2024-01-15',
    type: 'Top-up',
    description: 'FC Purchase',
    amount: '+500 FC',
    status: 'Completed',
    method: '•••• 4242'
  },
  {
    id: 'tx_002',
    date: '2024-01-14',
    type: 'Entry Fee',
    description: 'Madden Tournament Entry',
    amount: '-25 FC',
    status: 'Completed',
    method: 'FC Balance'
  },
  {
    id: 'tx_003',
    date: '2024-01-14',
    type: 'Prize',
    description: 'Tournament Winnings',
    amount: '+100 FC',
    status: 'Completed',
    method: 'FC Balance'
  },
  {
    id: 'tx_004',
    date: '2024-01-13',
    type: 'Entry Fee',
    description: 'Arena Warriors Challenge',
    amount: '-15 FC',
    status: 'Completed',
    method: 'FC Balance'
  },
  {
    id: 'tx_005',
    date: '2024-01-12',
    type: 'Top-up',
    description: 'FC Purchase',
    amount: '+200 FC',
    status: 'Completed',
    method: '•••• 8888'
  }
];

export function PaymentSettings() {
  const { toast } = useToast();
  const [fcBalance] = useState(1247);

  const handleAddPaymentMethod = () => {
    toast({
      title: "Add Payment Method",
      description: "Redirecting to secure payment setup...",
    });
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account.",
    });
  };

  const handleTopUp = () => {
    toast({
      title: "Top-up FC",
      description: "Opening FC purchase dialog...",
    });
  };

  const handleWithdraw = () => {
    toast({
      title: "Withdraw FC",
      description: "Withdrawal request submitted for review.",
    });
  };

  const handleDownloadStatement = () => {
    toast({
      title: "Downloading statement",
      description: "Your transaction history is being prepared...",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payments & Wallet</h2>
        <p className="text-muted-foreground">Manage your payment methods and FC balance</p>
      </div>

      {/* FC Balance */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>FC Balance</span>
          </CardTitle>
          <CardDescription>Your current FLOCKNODE Credit balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">{fcBalance.toLocaleString()} FC</div>
              <div className="text-sm text-muted-foreground">Available balance</div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleTopUp} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Top Up FC
              </Button>
              <Button 
                variant="outline" 
                onClick={handleWithdraw}
                disabled={fcBalance < 100}
              >
                Withdraw FC
              </Button>
            </div>
          </div>
          {fcBalance < 100 && (
            <div className="mt-3 p-3 bg-muted/20 border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Minimum withdrawal amount is 100 FC. Withdrawals are subject to review and may take 3-5 business days.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your cards and payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium flex items-center space-x-2">
                    <span>{method.type} •••• {method.last4}</span>
                    {method.default && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">Default</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!method.default && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this payment method? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemovePaymentMethod(method.id)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={handleAddPaymentMethod}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="gaming-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent FC transactions and payments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadStatement}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={
                    transaction.amount.startsWith('+') ? 'text-primary' : 
                    transaction.amount.startsWith('-') ? 'text-muted-foreground' : ''
                  }>
                    {transaction.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="gaming-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium text-primary">Secure Payments</div>
              <div className="text-sm text-muted-foreground">
                All payments are processed securely through Stripe. Your card information is encrypted and never stored on our servers.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}