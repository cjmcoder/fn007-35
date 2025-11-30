import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, Calculator, TrendingUp } from 'lucide-react';
import PayPalDeposit from '@/components/wallet/PayPalDeposit';
import PayPalWithdrawal from '@/components/wallet/PayPalWithdrawal';
import FeeCalculator from '@/components/wallet/FeeCalculator';

export default function WalletPage() {
  const [balance] = useState(1250.75); // Mock balance

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your FLOCKNODE balance and transactions
          </p>
        </div>

        {/* Balance Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
            <CardDescription>
              Your available FLOCKNODE credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {balance.toLocaleString()} FC
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">Active</Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Wallet Tabs */}
        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Fee Calculator
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PayPalDeposit />
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Information</CardTitle>
                  <CardDescription>
                    Important details about deposits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">PayPal Fees</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 2.9% + $0.30 per transaction</li>
                      <li>• Minimum deposit: $0.32</li>
                      <li>• Instant processing</li>
                      <li>• Secure PayPal integration</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Deposit Limits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Daily limit: $1,000</li>
                      <li>• Monthly limit: $10,000</li>
                      <li>• Verification required for higher limits</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PayPalWithdrawal />
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Information</CardTitle>
                  <CardDescription>
                    Important details about withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">PayPal Fees</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 2.9% + $0.30 per transaction</li>
                      <li>• Minimum withdrawal: 0.32 FC</li>
                      <li>• Processing time: 1-3 business days</li>
                      <li>• Secure PayPal integration</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Withdrawal Limits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Daily limit: $500</li>
                      <li>• Monthly limit: $5,000</li>
                      <li>• Verification required for higher limits</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <FeeCalculator />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Transaction history will appear here</p>
                  <p className="text-sm">Make your first deposit to get started!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}





