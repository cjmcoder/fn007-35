'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJSON, postJSON } from '../lib/api';
import { useToast } from '../providers/toast-provider';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export default function ChallengeBoard() {
  const router = useRouter();
  const { addToast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ 
    gameId:'topspin-2k25', 
    mode:'CONSOLE_VERIFIED_STREAM' as 'CONSOLE_VERIFIED_STREAM'|'CLOUD_STREAM', 
    stakeCents:500, 
    region:'NA-Central', 
    eloBand:'Bronze' 
  });

  useEffect(()=>{ 
    loadChallenges();
  }, []);

  async function loadChallenges() {
    try {
      setIsLoading(true);
      const challenges = await getJSON<any[]>('/api/challenge');
      setList(challenges);
    } catch (error: any) {
      console.error('Failed to load challenges:', error);
      addToast({
        title: 'Failed to Load Challenges',
        description: error.message || 'Unable to load challenge board',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function create() {
    try {
      setIsCreating(true);
      const ch = await postJSON('/api/challenge', form);
      setList(l=>[ch, ...l]);
      addToast({
        title: 'Challenge Posted',
        description: 'Your challenge is now visible on the board',
        type: 'success',
      });
      // Reset form
      setForm({ ...form, stakeCents: 500 });
    } catch (error: any) {
      console.error('Create challenge failed:', error);
      addToast({
        title: 'Failed to Post Challenge',
        description: error.message || 'Unable to create challenge',
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function acceptChallenge(id: string) {
    try {
      await postJSON(`/api/challenge/${id}/accept`, {});
      addToast({
        title: 'Challenge Accepted',
        description: 'Waiting for creator confirmation',
        type: 'success',
      });
      loadChallenges();
    } catch (error: any) {
      console.error('Accept challenge failed:', error);
      addToast({
        title: 'Failed to Accept',
        description: error.message || 'Unable to accept challenge',
        type: 'error',
      });
    }
  }

  async function confirmChallenge(id: string) {
    try {
      await postJSON(`/api/challenge/${id}/confirm`, {});
      addToast({
        title: 'Challenge Confirmed',
        description: 'Match is being created',
        type: 'success',
      });
      loadChallenges();
    } catch (error: any) {
      console.error('Confirm challenge failed:', error);
      addToast({
        title: 'Failed to Confirm',
        description: error.message || 'Unable to confirm challenge',
        type: 'error',
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Challenge Board</h1>
              <p className="text-muted-foreground mt-2">Post or accept custom challenges</p>
            </div>
            <button
              onClick={() => router.push('/play')}
              className="btn btn-outline"
            >
              ← QuickMatch
            </button>
          </div>

          {/* Create Challenge Form */}
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Post New Challenge</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-2">Game</label>
                <input 
                  className="input w-full" 
                  value={form.gameId} 
                  onChange={e=>setForm(f=>({...f,gameId:e.target.value}))}
                />
              </div>
              
              <div>
                <label className="label mb-2">Mode</label>
                <select 
                  className="input w-full" 
                  value={form.mode} 
                  onChange={e=>setForm(f=>({...f,mode:e.target.value as any}))}
                >
                  <option value="CONSOLE_VERIFIED_STREAM">Console Verified Stream</option>
                  <option value="CLOUD_STREAM">Cloud Stream</option>
                </select>
              </div>
              
              <div>
                <label className="label mb-2">Stake (cents)</label>
                <input 
                  className="input w-full" 
                  type="number" 
                  value={form.stakeCents} 
                  onChange={e=>setForm(f=>({...f,stakeCents:Number(e.target.value)}))}
                />
              </div>
              
              <div>
                <label className="label mb-2">Region</label>
                <input 
                  className="input w-full" 
                  value={form.region} 
                  onChange={e=>setForm(f=>({...f,region:e.target.value}))}
                />
              </div>
              
              <div>
                <label className="label mb-2">ELO Band</label>
                <input 
                  className="input w-full" 
                  value={form.eloBand} 
                  onChange={e=>setForm(f=>({...f,eloBand:e.target.value}))}
                />
              </div>
            </div>
            
            <button 
              onClick={create} 
              disabled={isCreating}
              className="btn btn-primary"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Posting...</span>
                </>
              ) : (
                '📋 Post Challenge'
              )}
            </button>
          </div>

          {/* Challenges List */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Open Challenges</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No open challenges</p>
                <p className="text-sm mt-1">Be the first to post one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((c)=>(
                  <div key={c.id} className="card p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-foreground">{c.gameId}</span>
                          <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">{c.mode}</span>
                          <span className="text-lg font-bold text-primary">${(c.stakeCents/100).toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>📍 {c.region}</span>
                          <span>🏆 {c.eloBand}</span>
                          {c.expiresAt && (
                            <span>⏰ Expires {new Date(c.expiresAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={()=>acceptChallenge(c.id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={()=>confirmChallenge(c.id)}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={loadChallenges}
                disabled={isLoading}
                className="btn btn-ghost btn-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

