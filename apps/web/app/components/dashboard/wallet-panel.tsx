'use client';

import { useState } from 'react';
import { WalletBalanceResponseDto } from '../../lib/shared-types';
import { useToast } from '../../providers/toast-provider';
import { api } from '../../lib/api-client';
import { LoadingSpinner } from '../ui/loading-spinner';

interface WalletPanelProps {
  walletData: WalletBalanceResponseDto | null;
  onRefresh: () => void;
}

export function WalletPanel({ walletData, onRefresh }: WalletPanelProps) {
  const { addToast } = useToast();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async (currency: string, amount: string) => {
    try {
      setIsLoading(true);
      const response = await api.createDeposit({
        currency,
        amountMinor: (parseFloat(amount) * (currency === 'FC' ? 100 : 1000000)).toString(),
      });

      if (response.data.hostedUrl) {
        // Redirect to Coinbase Commerce
        window.open(response.data.hostedUrl, '_blank');
      }

      addToast({
        title: 'Deposit Initiated',
        description: 'Complete the payment to add funds to your account',
        type: 'success',
      });

      setShowDepositModal(false);
    } catch (error) {
      console.error('Deposit failed:', error);
      addToast({
        title: 'Deposit Failed',
        description: 'Unable to create deposit request',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (currency: string, amount: string, address: string) => {
    try {
      setIsLoading(true);
      await api.withdrawFunds({
        currency,
        amountMinor: (parseFloat(amount) * (currency === 'FC' ? 100 : 1000000)).toString(),
        chain: 'BASE',
        toAddress: address,
      });

      addToast({
        title: 'Withdrawal Requested',
        description: 'Your withdrawal request has been submitted for review',
        type: 'success',
      });

      setShowWithdrawModal(false);
      onRefresh();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      addToast({
        title: 'Withdrawal Failed',
        description: error.response?.data?.message || 'Unable to process withdrawal',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowDepositModal(true)}
          className="btn btn-primary"
        >
          <span className="mr-2">💰</span>
          Deposit Funds
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="btn btn-outline"
        >
          <span className="mr-2">💸</span>
          Withdraw Funds
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

      {/* Balance Details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Balances</h3>
        
        {walletData?.balances && walletData.balances.length > 0 ? (
          walletData.balances.map((balance) => (
            <div key={balance.currency} className="flex justify-between items-center py-4 border-b border-border last:border-b-0">
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {balance.currency === 'FC' ? '🪙' : '💵'}
                </div>
                <div>
                  <p className="font-medium text-foreground">{balance.currency}</p>
                  <p className="text-sm text-muted-foreground">
                    {balance.currency === 'FC' ? 'FLOCKNODE Credits' : 'USD Coin'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">
                  {balance.balanceFormatted || balance.balance}
                </p>
                {balance.decimals !== undefined && (
                  <p className="text-sm text-muted-foreground">{balance.decimals} decimals</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No balances found</p>
            <p className="text-sm mt-1">Deposit funds to get started</p>
          </div>
        )}

        {walletData?.totalUsdValue && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total USD Value</span>
              <span className="text-xl font-bold text-flocknode-600">
                ${walletData.totalUsdValue}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
          isLoading={isLoading}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (currency: string, amount: string) => void;
  isLoading: boolean;
}

function DepositModal({ onClose, onDeposit, isLoading }: DepositModalProps) {
  const [currency, setCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onDeposit(currency, amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input w-full"
            >
              <option value="USDC">USDC (USD Coin)</option>
              <option value="FC">FC (FLOCKNODE Credits)</option>
            </select>
          </div>

          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="btn btn-primary flex-1"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Deposit'}
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

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (currency: string, amount: string, address: string) => void;
  isLoading: boolean;
}

function WithdrawModal({ onClose, onWithdraw, isLoading }: WithdrawModalProps) {
  const [currency, setCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && address && parseFloat(amount) > 0) {
      onWithdraw(currency, amount, address);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input w-full"
            >
              <option value="USDC">USDC (USD Coin)</option>
              <option value="FC">FC (FLOCKNODE Credits)</option>
            </select>
          </div>

          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              min="5"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder="Minimum $5.00"
              required
            />
          </div>

          <div>
            <label className="label">Withdrawal Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input w-full"
              placeholder="0x... (Base network address)"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Base network address for {currency}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || !amount || !address}
              className="btn btn-primary flex-1"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Request Withdrawal'}
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
