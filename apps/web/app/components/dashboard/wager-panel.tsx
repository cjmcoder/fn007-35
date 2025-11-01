'use client';

import { useState } from 'react';
import { WagerSummaryDto } from '../../lib/shared-types';
import { useToast } from '../../providers/toast-provider';
import { api } from '../../lib/api-client';
import { LoadingSpinner } from '../ui/loading-spinner';

interface WagerPanelProps {
  wagers: WagerSummaryDto[];
  onRefresh: () => void;
}

export function WagerPanel({ wagers, onRefresh }: WagerPanelProps) {
  const { addToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWager = async (matchId: string, amount: string, currency: string) => {
    try {
      setIsLoading(true);
      await api.createWager({
        matchId,
        entryMinor: (parseFloat(amount) * (currency === 'FC' ? 100 : 1000000)).toString(),
        currency,
      });

      addToast({
        title: 'Wager Created',
        description: 'Your wager is now open for opponents',
        type: 'success',
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (error: any) {
      console.error('Create wager failed:', error);
      addToast({
        title: 'Wager Creation Failed',
        description: error.response?.data?.message || 'Unable to create wager',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWager = async (wagerId: string) => {
    try {
      await api.joinWager(wagerId);
      
      addToast({
        title: 'Wager Joined',
        description: 'You have successfully joined the wager',
        type: 'success',
      });

      onRefresh();
    } catch (error: any) {
      console.error('Join wager failed:', error);
      addToast({
        title: 'Join Failed',
        description: error.response?.data?.message || 'Unable to join wager',
        type: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50';
      case 'LOCKED': return 'text-yellow-600 bg-yellow-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'CANCELLED': return 'text-muted-foreground bg-gray-50';
      default: return 'text-muted-foreground bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <span className="mr-2">⚔️</span>
          Create Wager
        </button>
        <button
          onClick={onRefresh}
          className="btn btn-ghost"
          disabled={isLoading}
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>

      {/* Wagers List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Your Wagers</h3>
        
        {wagers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No wagers found</p>
            <p className="text-sm mt-1">Create your first wager to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wagers.map((wager) => (
              <div key={wager.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">Match: {wager.matchId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(wager.status)}`}>
                        {wager.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Entry: <span className="font-medium">{wager.entryFormatted}</span>
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Creator: <strong>{wager.creator.username}</strong></span>
                      {wager.opponent ? (
                        <span>Opponent: <strong>{wager.opponent.username}</strong></span>
                      ) : (
                        <span className="text-muted-foreground">Waiting for opponent...</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {wager.status === 'OPEN' && !wager.opponent && (
                      <button
                        onClick={() => handleJoinWager(wager.id)}
                        className="btn btn-outline btn-sm"
                      >
                        Join
                      </button>
                    )}
                    {wager.winner && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Winner</p>
                        <p className="font-medium">{wager.winner.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Wager Modal */}
      {showCreateModal && (
        <CreateWagerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateWager}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

interface CreateWagerModalProps {
  onClose: () => void;
  onCreate: (matchId: string, amount: string, currency: string) => void;
  isLoading: boolean;
}

function CreateWagerModal({ onClose, onCreate, isLoading }: CreateWagerModalProps) {
  const [matchId, setMatchId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('FC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchId && amount && parseFloat(amount) > 0) {
      onCreate(matchId, amount, currency);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Wager</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Match ID</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="input w-full"
              placeholder="e.g., UFC299-MainEvent"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Unique identifier for the match you want to wager on
            </p>
          </div>

          <div>
            <label className="label">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input w-full"
            >
              <option value="FC">FC (FLOCKNODE Credits)</option>
              <option value="USDC">USDC (USD Coin)</option>
            </select>
          </div>

          <div>
            <label className="label">Entry Amount</label>
            <input
              type="number"
              min={currency === 'FC' ? '1' : '1'}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder={`Minimum ${currency === 'FC' ? '$1.00' : '$1.00'}`}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Amount each player must stake to participate
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || !matchId || !amount}
              className="btn btn-primary flex-1"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Wager'}
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
