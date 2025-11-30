import React from 'react';
import { useParams } from 'react-router-dom';
import { useLobbySocket } from '@/features/lobby/useLobbySocket';

export default function ConsoleLobby() {
  const { matchId } = useParams<{ matchId: string }>();
  
  if (!matchId) {
    return <div className="text-red-500">Invalid match ID</div>;
  }

  const { match, roomSize, status, error, cancelSearch } = useLobbySocket('console', matchId);

  return (
    <Shell mode="console" matchId={matchId}>
      <State status={status} error={error} roomSize={roomSize} matchId={matchId} match={match} onCancel={cancelSearch} />
    </Shell>
  );
}

function Shell({ children, mode, matchId }: any) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-700 text-xs rounded-full">Console Stream 1v1</span>
          <p className="text-sm text-gray-400">Room: {matchId}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: any) {
  return (
    <div className="rounded-2xl p-6 bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
      <h2 className="text-xl font-medium">{title}</h2>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}

function State({ status, error, roomSize, match, matchId, onCancel }: any) {
  if (status === 'connecting') return <Card title="Connecting…" subtitle="Setting up your console lobby…" />;
  if (status === 'waiting') return (
    <Card title="Waiting for an opponent…" subtitle={`Players: ${roomSize}/2`}>
      <button onClick={onCancel} className="rounded-xl px-4 py-3 bg-zinc-800 hover:bg-zinc-700">Cancel Search</button>
    </Card>
  );
  if (status === 'active' && match) return (
    <Card title="Opponent found!" subtitle={`Entry Fee: ${match.entryFee} FC`}>
      <a href={`/matches/${match.id}`} className="rounded-xl px-4 py-3 bg-blue-600 hover:bg-blue-500 inline-block">Go to Match</a>
    </Card>
  );
  if (status === 'cancelled') return <Card title="Search cancelled" subtitle={error || 'You left the queue.'} />;
  if (status === 'timeout') return (
    <Card title="No opponent found" subtitle="Try again or adjust filters.">
      <a href="/matches" className="rounded-xl px-4 py-3 bg-zinc-800 hover:bg-zinc-700 inline-block">Back to Lobby</a>
    </Card>
  );
  return <Card title="Error" subtitle={error || 'Something went wrong.'} />;
}
