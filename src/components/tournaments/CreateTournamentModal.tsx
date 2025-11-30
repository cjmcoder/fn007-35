import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, Users, Calendar, DollarSign } from 'lucide-react';

interface CreateTournamentData {
  title: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  maxParticipants: number;
  entryFee: number;
  startsAt: string;
}

interface TournamentFees {
  totalEntryFees: number;
  matchFee: number;
  netPrizePool: number;
  feePercentage: number;
}

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: (tournament: any) => void;
}

const GAMES = [
  'Valorant',
  'CS2',
  'League of Legends',
  'Dota 2',
  'Rocket League',
  'Fortnite',
  'Apex Legends',
  'Call of Duty',
  'Overwatch 2',
  'Rainbow Six Siege'
];

const TOURNAMENT_FORMATS = [
  { value: 'single-elimination', label: 'Single Elimination' },
  { value: 'double-elimination', label: 'Double Elimination' },
  { value: 'round-robin', label: 'Round Robin' }
];

export default function CreateTournamentModal({ isOpen, onClose, onTournamentCreated }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState<CreateTournamentData>({
    title: '',
    description: '',
    game: '',
    format: 'single-elimination',
    maxParticipants: 8,
    entryFee: 25,
    startsAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fees, setFees] = useState<TournamentFees | null>(null);

  const handleInputChange = (field: keyof CreateTournamentData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setError('');
    
    // Calculate fees when entry fee or max participants change
    if ((field === 'entryFee' || field === 'maxParticipants') && value > 0) {
      calculateFees(Number(newData.entryFee), Number(newData.maxParticipants));
    }
  };

  const calculateFees = async (entryFee: number, maxParticipants: number) => {
    try {
      const response = await fetch('/api/v1/tournaments/fees/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryFee, participantCount: maxParticipants }),
      });

      if (response.ok) {
        const data = await response.json();
        setFees({
          totalEntryFees: entryFee * maxParticipants,
          matchFee: data.matchFee,
          netPrizePool: data.netPrizePool,
          feePercentage: data.feePercentage
        });
      }
    } catch (err) {
      console.error('Failed to calculate fees:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tournament');
      }

      const tournament = await response.json();
      onTournamentCreated(tournament);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        game: '',
        format: 'single-elimination',
        maxParticipants: 8,
        entryFee: 25,
        startsAt: ''
      });
      setFees(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Create Tournament
          </CardTitle>
          <CardDescription>
            Start a new competitive tournament
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tournament Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter tournament title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter tournament description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select value={formData.game} onValueChange={(value) => handleInputChange('game', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {GAMES.map((game) => (
                    <SelectItem key={game} value={game}>
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Tournament Format</Label>
              <Select value={formData.format} onValueChange={(value: 'single-elimination' | 'double-elimination' | 'round-robin') => handleInputChange('format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOURNAMENT_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="2"
                max="64"
                step="1"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', Number(e.target.value))}
                placeholder="Enter max participants"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee (FC)</Label>
              <Input
                id="entryFee"
                type="number"
                min="0"
                step="1"
                value={formData.entryFee}
                onChange={(e) => handleInputChange('entryFee', Number(e.target.value))}
                placeholder="Enter entry fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startsAt">Start Date & Time</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => handleInputChange('startsAt', e.target.value)}
                required
              />
            </div>

            {fees && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Fee Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Entry Fees:</span>
                    <span className="font-medium">{fees.totalEntryFees} FC</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tournament Fee ({fees.feePercentage * 100}%):</span>
                    <span>{fees.matchFee} FC</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Net Prize Pool:</span>
                    <span>{fees.netPrizePool} FC</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.game || formData.maxParticipants < 2}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Tournament'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


