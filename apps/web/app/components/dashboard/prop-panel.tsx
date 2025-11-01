'use client';

import { useState } from 'react';
import { PropSummaryDto } from '../../lib/shared-types';
import { useToast } from '../../providers/toast-provider';
import { api } from '../../lib/api-client';
import { LoadingSpinner } from '../ui/loading-spinner';

interface PropPanelProps {
  props: PropSummaryDto[];
  onRefresh: () => void;
}

export function PropPanel({ props, onRefresh }: PropPanelProps) {
  const { addToast } = useToast();
  const [selectedProp, setSelectedProp] = useState<PropSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStakeProp = async (propId: string, side: string, amount: string) => {
    try {
      setIsLoading(true);
      await api.stakeProp({
        propId,
        side,
        entryMinor: (parseFloat(amount) * 100).toString(), // Assuming FC for now
      });

      addToast({
        title: 'Prop Stake Placed',
        description: `Successfully staked ${amount} FC on ${side}`,
        type: 'success',
      });

      setSelectedProp(null);
      onRefresh();
    } catch (error: any) {
      console.error('Prop stake failed:', error);
      addToast({
        title: 'Stake Failed',
        description: error.response?.data?.message || 'Unable to place stake',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'OFFERED': return 'text-blue-600 bg-blue-50';
      case 'LOCKED': return 'text-yellow-600 bg-yellow-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'VOID': return 'text-muted-foreground bg-gray-50';
      default: return 'text-muted-foreground bg-gray-50';
    }
  };

  const formatTimeRemaining = (cutoffAt: string) => {
    const cutoff = new Date(cutoffAt);
    const now = new Date();
    const diff = cutoff.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRefresh}
          className="btn btn-ghost"
          disabled={isLoading}
        >
          <span className="mr-2">🔄</span>
          Refresh Props
        </button>
      </div>

      {/* Props List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Available Props</h3>
        
        {props.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No props available</p>
            <p className="text-sm mt-1">Check back when matches are active</p>
          </div>
        ) : (
          <div className="space-y-4">
            {props.map((prop) => (
              <div key={prop.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{prop.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(prop.state)}`}>
                        {prop.state}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span>Match: <strong>{prop.matchId}</strong></span>
                      <span>Type: <strong>{prop.type}</strong></span>
                      <span>Cutoff: <strong>{formatTimeRemaining(prop.cutoffAt)}</strong></span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Entry: {prop.minEntryFormatted} - {prop.maxEntryFormatted}</span>
                      <span>Total Staked: <strong>{prop.totalStaked.toString()}</strong></span>
                    </div>

                    {/* Pool Information */}
                    {prop.pools && Object.keys(prop.pools).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-medium mb-2">Current Pools:</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(prop.pools).map(([side, pool]) => (
                            <div key={side} className="flex justify-between">
                              <span className="font-medium">{side}:</span>
                              <span>{pool.totalFormatted} ({pool.count} stakes)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {prop.state === 'OFFERED' && (
                      <button
                        onClick={() => setSelectedProp(prop)}
                        className="btn btn-primary btn-sm"
                      >
                        <span className="mr-1">🎯</span>
                        Stake
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stake Modal */}
      {selectedProp && (
        <StakePropModal
          prop={selectedProp}
          onClose={() => setSelectedProp(null)}
          onStake={handleStakeProp}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

interface StakePropModalProps {
  prop: PropSummaryDto;
  onClose: () => void;
  onStake: (propId: string, side: string, amount: string) => void;
  isLoading: boolean;
}

function StakePropModal({ prop, onClose, onStake, isLoading }: StakePropModalProps) {
  const [side, setSide] = useState('YES');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onStake(prop.id, side, amount);
    }
  };

  // Determine available sides based on prop type
  const getAvailableSides = () => {
    switch (prop.type) {
      case 'THRESHOLD':
      case 'ACCURACY':
        return ['YES', 'NO'];
      case 'RACE':
        return ['A', 'B'];
      default:
        return ['YES', 'NO'];
    }
  };

  const availableSides = getAvailableSides();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Stake on Prop</h3>
        
        {/* Prop Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">{prop.label}</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Match: {prop.matchId}</p>
            <p>Type: {prop.type}</p>
            <p>Entry Range: {prop.minEntryFormatted} - {prop.maxEntryFormatted}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Choose Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="input w-full"
            >
              {availableSides.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Stake Amount (FC)</label>
            <input
              type="number"
              min="0.50"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder="Enter stake amount"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum: {prop.minEntryFormatted} | Maximum: {prop.maxEntryFormatted}
            </p>
          </div>

          {/* Potential Payout Calculation */}
          {amount && prop.pools && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Estimated Payout</p>
              <p className="text-sm text-blue-600">
                Based on current pool sizes (subject to change)
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="btn btn-primary flex-1"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : `Stake ${amount || '0'} FC`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
