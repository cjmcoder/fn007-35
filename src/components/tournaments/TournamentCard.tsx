import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, Users, Clock, DollarSign, Calendar } from 'lucide-react';

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

interface TournamentCardProps {
  tournament: Tournament;
  currentUserId?: string;
  onJoinTournament: (tournamentId: string) => Promise<void>;
  onViewTournament: (tournamentId: string) => void;
}

export default function TournamentCard({ tournament, currentUserId, onJoinTournament, onViewTournament }: TournamentCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isParticipant = tournament.participants.some(p => p.userId === currentUserId);
  const canJoin = !isParticipant && tournament.status === 'upcoming' && tournament.participants.length < tournament.maxParticipants;
  const isFull = tournament.participants.length >= tournament.maxParticipants;

  const handleJoinTournament = async () => {
    setLoading(true);
    setError('');

    try {
      await onJoinTournament(tournament.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join tournament');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'registration': return 'bg-green-500';
      case 'active': return 'bg-yellow-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'registration': return 'Registration Open';
      case 'active': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getFormatText = (format: string) => {
    switch (format) {
      case 'single-elimination': return 'Single Elimination';
      case 'double-elimination': return 'Double Elimination';
      case 'round-robin': return 'Round Robin';
      default: return format;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressPercentage = () => {
    return (tournament.participants.length / tournament.maxParticipants) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{tournament.title}</CardTitle>
          </div>
          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
            {getStatusText(tournament.status)}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <p>{tournament.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {tournament.entryFee} FC Entry
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {tournament.totalPrizePool} FC Prize Pool
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(tournament.startsAt)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Format:</span>
            <Badge variant="outline" className="capitalize">
              {getFormatText(tournament.format)}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Participants:</span>
            <span>
              {tournament.participants.length}/{tournament.maxParticipants}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Registration Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Participants List */}
          {tournament.participants.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Participants</h4>
              <div className="flex flex-wrap gap-1">
                {tournament.participants.slice(0, 6).map((participant) => (
                  <Badge 
                    key={participant.id} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {participant.username}
                  </Badge>
                ))}
                {tournament.participants.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tournament.participants.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {canJoin && (
              <Button
                onClick={handleJoinTournament}
                disabled={loading}
                className="flex-1"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Tournament'
                )}
              </Button>
            )}

            {isParticipant && (
              <Button
                onClick={() => onViewTournament(tournament.id)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                View Tournament
              </Button>
            )}

            {isFull && !isParticipant && (
              <Button
                onClick={() => onViewTournament(tournament.id)}
                variant="outline"
                className="flex-1"
                size="sm"
                disabled
              >
                Tournament Full
              </Button>
            )}

            {!canJoin && !isParticipant && !isFull && (
              <Button
                onClick={() => onViewTournament(tournament.id)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





