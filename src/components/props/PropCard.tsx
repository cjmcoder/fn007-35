import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Target, Clock, DollarSign, TrendingUp } from 'lucide-react';

interface PropOption {
  id: string;
  title: string;
  odds: number;
  totalWagered: number;
  wagerCount: number;
}

interface Prop {
  id: string;
  title: string;
  description: string;
  category: 'game' | 'tournament' | 'player' | 'team';
  game?: string;
  options: PropOption[];
  status: 'open' | 'closed' | 'settled';
  totalWagered: number;
  houseVig: number;
  createdAt: string;
  closesAt: string;
  settledAt?: string;
  winningOptionId?: string;
}

interface PropCardProps {
  prop: Prop;
  onPlaceWager: (propId: string, optionId: string, amount: number) => Promise<void>;
}

export default function PropCard({ prop, onPlaceWager }: PropCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [wagerAmount, setWagerAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isOpen = prop.status === 'open' && new Date(prop.closesAt) > new Date();

  const handlePlaceWager = async () => {
    if (!selectedOption || !wagerAmount || Number(wagerAmount) <= 0) {
      setError('Please select an option and enter a valid wager amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onPlaceWager(prop.id, selectedOption, Number(wagerAmount));
      setSelectedOption('');
      setWagerAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place wager');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'closed': return 'bg-yellow-500';
      case 'settled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      case 'settled': return 'Settled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatOdds = (odds: number) => {
    return `${odds.toFixed(2)}x`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{prop.title}</CardTitle>
          </div>
          <Badge className={`${getStatusColor(prop.status)} text-white`}>
            {getStatusText(prop.status)}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <p>{prop.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {prop.totalWagered} FC Wagered
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {prop.houseVig} FC House Vig
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Closes: {formatDate(prop.closesAt)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Options */}
          <div className="space-y-2">
            <h4 className="font-medium">Options</h4>
            <div className="grid grid-cols-1 gap-2">
              {prop.options.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => isOpen && setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.wagerCount} wagers • {option.totalWagered} FC
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatOdds(option.odds)}</div>
                      <div className="text-xs text-muted-foreground">odds</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wager Input */}
          {isOpen && selectedOption && (
            <div className="space-y-2">
              <h4 className="font-medium">Place Wager</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
                <Button
                  onClick={handlePlaceWager}
                  disabled={loading || !wagerAmount || Number(wagerAmount) <= 0}
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Wager'
                  )}
                </Button>
              </div>
              {wagerAmount && Number(wagerAmount) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Potential payout: {(Number(wagerAmount) * 0.85 * prop.options.find(o => o.id === selectedOption)?.odds || 0).toFixed(2)} FC
                  <br />
                  (After 15% house vig)
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Settled Info */}
          {prop.status === 'settled' && prop.winningOptionId && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-green-600">Winner: {prop.options.find(o => o.id === prop.winningOptionId)?.title}</div>
                <div className="text-muted-foreground">Settled: {prop.settledAt ? formatDate(prop.settledAt) : 'Unknown'}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}





