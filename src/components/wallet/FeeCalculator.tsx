import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info } from 'lucide-react';

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

interface MatchFeeResult {
  totalAmount: number;
  matchFee: number;
  netAmount: number;
  feePercentage: number;
}

interface PropVigResult {
  wagerAmount: number;
  vigAmount: number;
  netPayout: number;
  vigPercentage: number;
}

export default function FeeCalculator() {
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [matchAmount, setMatchAmount] = useState<string>('');
  const [propAmount, setPropAmount] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchFeeResult | null>(null);
  const [propResult, setPropResult] = useState<PropVigResult | null>(null);
  const [loading, setLoading] = useState(false);
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

  const calculateMatchFees = async () => {
    if (!matchAmount || parseFloat(matchAmount) <= 0) {
      setError('Please enter a valid match amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/payments/paypal/fees/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchAmount: parseFloat(matchAmount) }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate match fees');
      }

      const data = await response.json();
      setMatchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate match fees');
    } finally {
      setLoading(false);
    }
  };

  const calculatePropVig = async () => {
    if (!propAmount || parseFloat(propAmount) <= 0) {
      setError('Please enter a valid wager amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/payments/paypal/fees/prop-vig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wagerAmount: parseFloat(propAmount) }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate prop vig');
      }

      const data = await response.json();
      setPropResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate prop vig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fee Calculator
          </CardTitle>
          <CardDescription>
            Calculate fees for matches and prop bets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {feeStructure && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm space-y-1">
                  <div><strong>Match Fee:</strong> {feeStructure.match.percentage * 100}% of match total</div>
                  <div><strong>Prop Vig:</strong> {feeStructure.propVig.percentage * 100}% house edge</div>
                  <div><strong>PayPal Fee:</strong> {feeStructure.paypal.percentage * 100}% + ${feeStructure.paypal.fixed}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Match Fee Calculator */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Match Entry Fee</h3>
            <div className="space-y-2">
              <label htmlFor="matchAmount" className="text-sm font-medium">
                Match Total (FC)
              </label>
              <div className="flex gap-2">
                <Input
                  id="matchAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter match total"
                  value={matchAmount}
                  onChange={(e) => setMatchAmount(e.target.value)}
                />
                <Button
                  onClick={calculateMatchFees}
                  disabled={loading || !matchAmount}
                  variant="outline"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {matchResult && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Match Fee Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Match Total:</span>
                    <span className="font-medium">{matchResult.totalAmount} FC</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Entry Fee ({matchResult.feePercentage * 100}%):</span>
                    <span>{matchResult.matchFee} FC</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Net Amount:</span>
                    <span>{matchResult.netAmount} FC</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prop Bet Vig Calculator */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Prop Bet House Vig</h3>
            <div className="space-y-2">
              <label htmlFor="propAmount" className="text-sm font-medium">
                Wager Amount (FC)
              </label>
              <div className="flex gap-2">
                <Input
                  id="propAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter wager amount"
                  value={propAmount}
                  onChange={(e) => setPropAmount(e.target.value)}
                />
                <Button
                  onClick={calculatePropVig}
                  disabled={loading || !propAmount}
                  variant="outline"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {propResult && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Prop Bet Vig Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Wager Amount:</span>
                    <span className="font-medium">{propResult.wagerAmount} FC</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>House Vig ({propResult.vigPercentage * 100}%):</span>
                    <span>{propResult.vigAmount} FC</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Net Payout:</span>
                    <span>{propResult.netPayout} FC</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


