import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  ArrowUpDown,
  History,
  Settings
} from 'lucide-react';

interface WalletTransaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss' | 'bonus' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'paypal' | 'stripe' | 'crypto' | 'bank' | 'internal';
  description: string;
  createdAt: string;
  processedAt?: string;
  referenceId?: string;
  fees: number;
  netAmount: number;
}

interface UserWallet {
  id: string;
  userId: string;
  username: string;
  email: string;
  balance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWinnings: number;
  totalLosses: number;
  isActive: boolean;
  isVerified: boolean;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  transactionCount: number;
}

interface WalletManagerProps {
  className?: string;
}

export const WalletManager: React.FC<WalletManagerProps> = ({ className = '' }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'flocknodeadmin',
      type: 'deposit',
      amount: 1000,
      status: 'completed',
      method: 'paypal',
      description: 'Initial deposit',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      referenceId: 'PP_123456789',
      fees: 29.99,
      netAmount: 970.01
    },
    {
      id: '2',
      userId: 'user2',
      username: 'demo_user',
      type: 'withdrawal',
      amount: 500,
      status: 'pending',
      method: 'paypal',
      description: 'Withdrawal request',
      createdAt: new Date().toISOString(),
      referenceId: 'WD_987654321',
      fees: 14.99,
      netAmount: 485.01
    },
    {
      id: '3',
      userId: 'user1',
      username: 'flocknodeadmin',
      type: 'win',
      amount: 250,
      status: 'completed',
      method: 'internal',
      description: 'Tournament winnings',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      fees: 0,
      netAmount: 250
    }
  ]);

  const [userWallets, setUserWallets] = useState<UserWallet[]>([
    {
      id: '1',
      userId: 'user1',
      username: 'flocknodeadmin',
      email: 'flocknodeadmin@flocknode.com',
      balance: 10000,
      lockedBalance: 0,
      totalDeposited: 15000,
      totalWithdrawn: 5000,
      totalWinnings: 2500,
      totalLosses: 500,
      isActive: true,
      isVerified: true,
      lastActivity: new Date().toISOString(),
      riskLevel: 'low',
      transactionCount: 25
    },
    {
      id: '2',
      userId: 'user2',
      username: 'demo_user',
      email: 'demo@flocknode.com',
      balance: 1000,
      lockedBalance: 250,
      totalDeposited: 2000,
      totalWithdrawn: 750,
      totalWinnings: 500,
      totalLosses: 750,
      isActive: true,
      isVerified: true,
      lastActivity: new Date().toISOString(),
      riskLevel: 'medium',
      transactionCount: 18
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  const { toast } = useToast();

  const handleTransactionAction = (transactionId: string, action: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    let updatedStatus = transaction.status;
    let message = '';

    switch (action) {
      case 'approve':
        if (transaction.status === 'pending') {
          updatedStatus = 'completed';
          message = 'Transaction approved successfully';
        }
        break;
      case 'reject':
        updatedStatus = 'failed';
        message = 'Transaction rejected';
        break;
      case 'cancel':
        updatedStatus = 'cancelled';
        message = 'Transaction cancelled';
        break;
    }

    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: updatedStatus, processedAt: new Date().toISOString() }
        : t
    ));

    toast({
      title: "Transaction Updated",
      description: message,
    });
  };

  const handleWalletAction = (userId: string, action: string) => {
    toast({
      title: "Wallet Action",
      description: `${action} action performed on user ${userId}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      deposit: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: TrendingUp },
      withdrawal: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: TrendingDown },
      win: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      loss: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      bonus: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: DollarSign },
      refund: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: ArrowUpDown }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
      high: { color: 'bg-red-100 text-red-800 border-red-300', icon: Ban }
    };

    const config = riskConfig[riskLevel as keyof typeof riskConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalStats = {
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.reduce((sum, t) => sum + t.fees, 0)
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Wallet className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Wallet Manager</h2>
            <p className="text-muted-foreground">Manage user wallets and transactions</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLoading(true)} className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-primary hover:shadow-glow text-background">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <History className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.pendingTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalStats.totalVolume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalStats.totalFees)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="wallets">User Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">Transaction Management</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-primary/20 rounded-lg p-4 glass-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">@{transaction.username}</h3>
                          <div className="flex space-x-2">
                            {getTypeBadge(transaction.type)}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Net Amount</p>
                            <p className="font-semibold text-foreground">{formatCurrency(transaction.netAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Fees</p>
                            <p className="font-semibold text-foreground">{formatCurrency(transaction.fees)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Method</p>
                            <p className="font-semibold text-foreground capitalize">{transaction.method}</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-2">{transaction.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Created: {formatDate(transaction.createdAt)}</span>
                          {transaction.processedAt && <span>Processed: {formatDate(transaction.processedAt)}</span>}
                          {transaction.referenceId && <span>Ref: {transaction.referenceId}</span>}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {transaction.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleTransactionAction(transaction.id, 'approve')}
                              className="bg-gradient-primary hover:shadow-glow text-background"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTransactionAction(transaction.id, 'reject')}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Found</h3>
                    <p className="text-muted-foreground">No transactions match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="gradient-text">User Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userWallets.map((wallet) => (
                  <div key={wallet.id} className="border border-primary/20 rounded-lg p-4 glass-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-foreground">@{wallet.username}</h3>
                          <div className="flex space-x-2">
                            {getRiskBadge(wallet.riskLevel)}
                            <Badge className={wallet.isActive ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                              {wallet.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className={wallet.isVerified ? "bg-accent/20 text-accent border-accent/30" : "bg-yellow-100 text-yellow-800 border-yellow-300"}>
                              {wallet.isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <p className="font-semibold text-foreground">{formatCurrency(wallet.balance)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Locked</p>
                            <p className="font-semibold text-foreground">{formatCurrency(wallet.lockedBalance)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Deposited</p>
                            <p className="font-semibold text-foreground">{formatCurrency(wallet.totalDeposited)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                            <p className="font-semibold text-foreground">{formatCurrency(wallet.totalWithdrawn)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Winnings</p>
                            <p className="font-semibold text-secondary">{formatCurrency(wallet.totalWinnings)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Losses</p>
                            <p className="font-semibold text-destructive">{formatCurrency(wallet.totalLosses)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                            <p className="font-semibold text-foreground">{wallet.transactionCount}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Email: {wallet.email}</span>
                          <span>Last Activity: {formatDate(wallet.lastActivity)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-secondary/30 text-secondary hover:bg-secondary/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWalletAction(wallet.userId, wallet.isActive ? 'Deactivate' : 'Activate')}
                          className={wallet.isActive ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-secondary/30 text-secondary hover:bg-secondary/10"}
                        >
                          {wallet.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletManager;


