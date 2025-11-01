'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJSON, postJSON } from '../../lib/api';
import { useToast } from '../../providers/toast-provider';
import Timer from '../../components/Timer';
import StreamChecklist from '../../components/StreamChecklist';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export default function MatchRoom({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { id } = params;
  const [m, setM] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(()=>{ 
    loadMatch();
    const interval = setInterval(loadMatch, 5000);
    return ()=>clearInterval(interval);
  },[id]);

  async function loadMatch() {
    try {
      const match = await getJSON(`/api/match/${id}`);
      setM(match);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load match:', error);
      setIsLoading(false);
      addToast({
        title: 'Failed to Load Match',
        description: error.message || 'Unable to load match details',
        type: 'error',
      });
    }
  }

  const goLive = async () => {
    try {
      setIsSubmitting(true);
      await postJSON(`/api/match/${id}/stream-ready`, { 
        streamUrl: 'https://flock.tube/demo', 
        overlayNonce: 'ABCD-1234' 
      });
      await loadMatch();
      addToast({
        title: 'Stream Ready',
        description: 'Your stream is now live',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Go live failed:', error);
      addToast({
        title: 'Failed to Go Live',
        description: error.message || 'Unable to set stream ready',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const report = async () => {
    try {
      setIsSubmitting(true);
      await postJSON(`/api/match/${id}/report`, { score: '2-0' });
      await loadMatch();
      addToast({
        title: 'Score Reported',
        description: 'Your score has been submitted',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Report failed:', error);
      addToast({
        title: 'Failed to Report Score',
        description: error.message || 'Unable to submit score',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !m) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    READY: 'bg-blue-100 text-blue-800',
    LIVE: 'bg-green-100 text-green-800',
    REPORTED: 'bg-yellow-100 text-yellow-800',
    VERIFY: 'bg-purple-100 text-purple-800',
    SETTLED: 'bg-gray-100 text-gray-800',
    VOID: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Match Room</h1>
              <p className="text-muted-foreground mt-1">Match ID: {m.id.slice(0,8)}</p>
            </div>
            <button
              onClick={() => router.push('/play')}
              className="btn btn-outline btn-sm"
            >
              ← Back
            </button>
          </div>

          {/* Match Status */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[m.status] || 'bg-gray-100 text-gray-800'}`}>
                    {m.status}
                  </span>
                </div>
              </div>
              {m.startBy && (
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Start By</span>
                  <div className="mt-1 text-lg font-bold">
                    <Timer target={m.startBy} />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Game:</span>
                <span className="ml-2 font-medium">{m.gameId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mode:</span>
                <span className="ml-2 font-medium">{m.mode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stake:</span>
                <span className="ml-2 font-medium">${(m.stakeCents/100).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Players:</span>
                <span className="ml-2 font-medium">{m.playerAId?.slice(0,6)} vs {m.playerBId?.slice(0,6)}</span>
              </div>
            </div>
          </div>

          {/* Stream Setup */}
          {m.status === 'READY' || m.status === 'LIVE' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Stream</h3>
                <StreamChecklist nonce="ABCD-1234" />
                {!m.streamA && (
                  <button 
                    onClick={goLive} 
                    disabled={isSubmitting}
                    className="btn btn-primary w-full mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Setting up...</span>
                      </>
                    ) : (
                      '📹 I\'m Live'
                    )}
                  </button>
                )}
                {m.streamA && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">✓ Stream connected: {m.streamA}</p>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Opponent Stream</h3>
                {m.streamB ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">✓ Opponent is live: {m.streamB}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Waiting for opponent...</p>
                    <p className="text-xs mt-1">They need to go live to start the match</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Score Reporting */}
          {m.status === 'LIVE' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Report Score</h3>
              <button 
                onClick={report} 
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  '📊 Report Score'
                )}
              </button>
            </div>
          )}

          {/* Match Info */}
          {m.status === 'SETTLED' && (
            <div className="card p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Match Settled</h3>
              <p className="text-sm text-green-700">This match has been completed and settled.</p>
            </div>
          )}

          {m.status === 'VOID' && (
            <div className="card p-6 bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Match Voided</h3>
              <p className="text-sm text-red-700">This match was cancelled or voided.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
