import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { walletApi } from '@/lib/api-client';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Unlock, 
  CreditCard, 
  Banknote,
  Clock,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';

interface WalletBalance {
  balance: number;
  locked: number;
  available: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'match_win' | 'match_loss' | 'lock' | 'unlock';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface EnhancedWalletProps {
  className?: string;
  showActions?: boolean;
}

export const EnhancedWallet: React.FC<EnhancedWalletProps> = ({ 
  className = '', 
  showActions = true 
}) => {
  const [balance, setBalance] = useState<WalletBalance>({ balance: 0, locked: 0, available: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadWalletData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadWalletData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWalletData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      
      const [balanceData, historyData] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getHistory({ limit: 20 })
      ]);

      setBalance(balanceData);
      setTransactions(historyData.transactions);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setRefreshing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'match_win':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'match_loss':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'lock':
        return <Lock className="w-4 h-4 text-yellow-600" />;
      case 'unlock':
        return <Unlock className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'deposit' || type === 'match_win') {
      return 'text-green-600';
    } else if (type === 'withdrawal' || type === 'match_loss') {
      return 'text-red-600';
    } else if (type === 'lock') {
      return 'text-yellow-600';
    } else if (type === 'unlock') {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                ${balance.available.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Locked Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                ${balance.locked.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">In active matches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Banknote className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                ${balance.balance.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">All funds</p>
          </CardContent>
        </Card>
      </div>

      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadWalletData(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowDeposit(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Deposit Funds
              </Button>
              <Button 
                onClick={() => setShowWithdraw(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-600">Your transaction history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatTimestamp(transaction.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                      {formatAmount(transaction.amount)}
                    </span>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Balance Warning */}
      {balance.available < 25 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your available balance is low. Consider depositing more funds to participate in matches.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedWallet;


