'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON, getTrustMe } from '../lib/api';
import { useMatchStore } from '../lib/useMatchStore';
import { useToast } from '../providers/toast-provider';
import TrustBadge from '../components/TrustBadge';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export default function PlayPage() {
  const router = useRouter();
  const { setPhase, setData } = useMatchStore();
  const { addToast } = useToast();
  const [form, setForm] = useState({ 
    gameId:'topspin-2k25', 
    mode:'CONSOLE_VERIFIED_STREAM' as 'CONSOLE_VERIFIED_STREAM'|'CLOUD_STREAM', 
    region:'NA-Central', 
    stakeCents:500, 
    eloBand:'Bronze' 
  });
  const [trust, setTrust] = useState<{ score:number; effects:string[] }>();
  const [isSeeking, setIsSeeking] = useState(false);
  
  useEffect(()=>{ 
    getTrustMe()
      .then(setTrust)
      .catch(()=>{
        // Set default if trust check fails
        setTrust({ score: 100, effects: [] });
      }); 
  }, []);

  const locked = trust?.effects?.includes('locked_quickmatch');

  async function onSeek() {
    if (locked || isSeeking) return;
    
    try {
      setIsSeeking(true);
      setPhase('SEEKING');
      const res = await postJSON<{ match?: any; ticketId?: string; altChallenges?: any[] }>('/api/match/seek', form);
      
      if (res.match) {
        setData({ match: res.match, phase:'READY' });
        router.push(`/match/${res.match.id}`);
        addToast({
          title: 'Match Found!',
          description: 'You\'ve been matched with an opponent',
          type: 'success',
        });
      } else {
        setData({ ticketId: res.ticketId, altChallenges: res.altChallenges });
        addToast({
          title: 'Searching...',
          description: 'Looking for an opponent. You\'ll be notified when matched.',
          type: 'info',
        });
      }
    } catch (error: any) {
      console.error('Seek failed:', error);
      setPhase('IDLE');
      addToast({
        title: 'Match Search Failed',
        description: error.message || 'Unable to search for matches. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSeeking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Find Match</h1>
            <p className="text-muted-foreground mt-2">QuickMatch pairs you with opponents instantly</p>
          </div>

          {/* Trust Score Display */}
          {trust && (
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Your Trust Score</span>
                <TrustBadge score={trust.score} />
              </div>
              {trust.effects.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Effects: {trust.effects.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Match Form */}
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Match Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-2">Game</label>
                <input 
                  className="input w-full" 
                  value={form.gameId} 
                  onChange={e=>setForm(f=>({...f,gameId:e.target.value}))}
                  placeholder="e.g., topspin-2k25"
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
                <label className="label mb-2">Region</label>
                <input 
                  className="input w-full" 
                  value={form.region} 
                  onChange={e=>setForm(f=>({...f,region:e.target.value}))}
                  placeholder="e.g., NA-Central"
                />
              </div>
              
              <div>
                <label className="label mb-2">Stake (cents)</label>
                <input 
                  className="input w-full" 
                  type="number" 
                  value={form.stakeCents} 
                  onChange={e=>setForm(f=>({...f,stakeCents:Number(e.target.value)}))}
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="label mb-2">ELO Band</label>
                <input 
                  className="input w-full" 
                  value={form.eloBand} 
                  onChange={e=>setForm(f=>({...f,eloBand:e.target.value}))}
                  placeholder="e.g., Bronze"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3">
            <button
              onClick={onSeek}
              disabled={locked || isSeeking}
              className="btn btn-primary flex-1"
            >
              {isSeeking ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Searching...</span>
                </>
              ) : locked ? (
                'QuickMatch Locked (Use Challenge Board)'
              ) : (
                '🎮 Play Now'
              )}
            </button>
            
            <button
              onClick={() => router.push('/challenges')}
              className="btn btn-outline"
            >
              View Challenges
            </button>
          </div>

          {locked && (
            <div className="card p-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Your Trust Score is below 60. QuickMatch is locked. Please use the Challenge Board or improve your Trust Score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
