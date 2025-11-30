import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, RefreshCw, Users, DollarSign, Calendar } from 'lucide-react';
import TournamentCard from './TournamentCard';
import CreateTournamentModal from './CreateTournamentModal';

interface TournamentParticipant {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  seed: number;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  joinedAt: string;
  eliminatedAt?: string;
}

interface Tournament {
  id: string;
  title: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  maxParticipants: number;
  entryFee: number;
  totalPrizePool: number;
  status: 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled';
  participants: TournamentParticipant[];
  createdAt: string;
  startsAt: string;
  completedAt?: string;
  winnerId?: string;
}

interface TournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalParticipants: number;
  totalPrizePool: number;
  averageEntryFee: number;
}

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<TournamentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/v1/tournaments');
      if (!response.ok) {
        throw new Error('Failed to load tournaments');
      }
      const data = await response.json();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/tournaments/stats/overview');
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTournaments(), loadStats()]);
    setRefreshing(false);
  };

  const handleJoinTournament = async (tournamentId: string) => {
    const response = await fetch('/api/v1/tournaments/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tournamentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to join tournament');
    }

    // Refresh tournaments after joining
    await loadTournaments();
  };

  const handleViewTournament = (tournamentId: string) => {
    // Navigate to tournament details page
    console.log('View tournament:', tournamentId);
  };

  const handleTournamentCreated = (tournament: Tournament) => {
    setTournaments(prev => [tournament, ...prev]);
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        totalTournaments: prev.totalTournaments + 1,
        totalPrizePool: prev.totalPrizePool + tournament.totalPrizePool
      } : null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTournaments(), loadStats()]);
      setLoading(false);
    };

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadTournaments, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground">
            Join competitive tournaments and compete for prizes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tournaments</p>
                  <p className="text-2xl font-bold">{stats.totalTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Tournaments</p>
                  <p className="text-2xl font-bold">{stats.activeTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                  <p className="text-2xl font-bold">{stats.totalPrizePool} FC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tournaments */}
      <div className="space-y-4">
        {tournaments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tournaments available</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a tournament and start competing!
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Trophy className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                currentUserId="demo_user"
                onJoinTournament={handleJoinTournament}
                onViewTournament={handleViewTournament}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTournamentCreated={handleTournamentCreated}
      />
    </div>
  );
}


