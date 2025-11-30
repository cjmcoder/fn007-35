import React from 'react';
import FindMatchButton from '@/features/lobby/FindMatchButton';

export default function TestLobbyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Test Lobby - Find Match Buttons</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Console Mode */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Console Mode</h2>
            <div className="space-y-3">
              <FindMatchButton 
                game="Madden" 
                platform="PS5" 
                mode="console" 
                userId="testuser1" 
              />
              <FindMatchButton 
                game="FIFA" 
                platform="Xbox" 
                mode="console" 
                userId="testuser1" 
              />
            </div>
          </div>

          {/* Cloud Mode */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-emerald-400">Cloud Mode</h2>
            <div className="space-y-3">
              <FindMatchButton 
                game="Madden" 
                platform="PC" 
                mode="cloud" 
                userId="testuser1" 
              />
              <FindMatchButton 
                game="UFC" 
                platform="PS5" 
                mode="cloud" 
                userId="testuser1" 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
            <li>Click any "Find Console/Cloud 1v1" button</li>
            <li>Should create a match and navigate to /lobby/[mode]/[matchId]</li>
            <li>Console lobbies show blue branding, Cloud lobbies show green</li>
            <li>Open a second tab and click the opposite mode for same game/platform</li>
            <li>Both tabs should show "Opponent found!" and "Go to Match" button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
