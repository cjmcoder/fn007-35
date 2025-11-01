'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/auth-provider';
import { useToast } from '../../providers/toast-provider';
import { api } from '../../lib/api-client';
import { WalletBalanceResponseDto, WagerSummaryDto, PropSummaryDto } from '../../lib/shared-types';
import { LoadingSpinner } from '../ui/loading-spinner';
import { WalletPanel } from './wallet-panel';
import { WagerPanel } from './wager-panel';
import { PropPanel } from './prop-panel';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'wallet' | 'wagers' | 'props'>('wallet');
  const [walletData, setWalletData] = useState<WalletBalanceResponseDto | null>(null);
  const [wagers, setWagers] = useState<WagerSummaryDto[]>([]);
  const [props, setProps] = useState<PropSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [walletResponse, wagersResponse, propsResponse] = await Promise.all([
        api.getWalletBalance(),
        api.getWagers({ limit: 10 }),
        api.getProps({ limit: 10 }),
      ]);

      setWalletData(walletResponse.data);
      setWagers(wagersResponse.data.wagers || []);
      setProps(propsResponse.data.props || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        title: 'Success',
        description: 'Logged out successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'wagers', label: 'Wagers', icon: '⚔️' },
    { id: 'props', label: 'Props', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-flocknode-900">
                FLOCKNODE
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-medium ml-1">{user?.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {walletData?.balances && walletData.balances.length > 0 ? (
            walletData.balances.map((balance) => (
              <div key={balance.currency} className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {balance.currency === 'FC' ? 'FLOCKNODE Credits' : 'USD Coin'}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {balance.balanceFormatted || balance.balance}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {balance.currency === 'FC' ? '🪙' : '💵'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-6 col-span-full text-center text-muted-foreground">
              <p>No wallet balances</p>
            </div>
          )}
          
          <div className="card p-6 bg-gradient-to-r from-flocknode-500 to-flocknode-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-flocknode-100">KYC Status</p>
                <p className="text-xl font-bold">
                  {user?.kycStatus || 'Not Started'}
                </p>
              </div>
              <div className="text-3xl">
                {user?.kycStatus === 'APPROVED' ? '✅' : '⏳'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-flocknode-500 text-flocknode-600'
                    : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-border-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'wallet' && (
            <WalletPanel 
              walletData={walletData} 
              onRefresh={loadDashboardData}
            />
          )}
          
          {activeTab === 'wagers' && (
            <WagerPanel 
              wagers={wagers} 
              onRefresh={loadDashboardData}
            />
          )}
          
          {activeTab === 'props' && (
            <PropPanel 
              props={props} 
              onRefresh={loadDashboardData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
