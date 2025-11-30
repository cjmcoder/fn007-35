import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gamepad2, Zap, Target, DollarSign, Clock, Users } from 'lucide-react';

interface UnifiedMatchCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (matchData: any) => void;
  gameMode: 'console_stream' | 'cloud_gaming' | null;
}

const consoleGames = [
  { id: 'tekken8', name: 'Tekken 8', category: 'Fighting', entryFee: 2 },
  { id: 'sf6', name: 'Street Fighter 6', category: 'Fighting', entryFee: 2 },
  { id: 'gt7', name: 'Gran Turismo 7', category: 'Racing', entryFee: 3 },
  { id: 'fifa24', name: 'FIFA 24', category: 'Sports', entryFee: 2 },
  { id: 'cod-mw3', name: 'Call of Duty: MW3', category: 'FPS', entryFee: 3 },
];

const cloudGames = [
  { id: 'tekken5', name: 'Tekken 5 (Emulated)', category: 'Fighting', entryFee: 2 },
  { id: 'flocknode-drift', name: 'FLOCKNODE Drift', category: 'Racing', entryFee: 2 },
  { id: 'flocknode-knockout', name: 'FLOCKNODE Knockout', category: 'Fighting', entryFee: 2 },
  { id: 'flocknode-streetball', name: 'FLOCKNODE Streetball', category: 'Sports', entryFee: 2 },
];

export function UnifiedMatchCreation({ isOpen, onClose, onCreateMatch, gameMode }: UnifiedMatchCreationProps) {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [entryFee, setEntryFee] = useState<number>(2);
  const [matchType, setMatchType] = useState<string>('best_of_3');
  const [customEntryFee, setCustomEntryFee] = useState<string>('');

  const games = gameMode === 'console_stream' ? consoleGames : cloudGames;
  const selectedGameData = games.find(g => g.id === selectedGame);

  const handleCreateMatch = () => {
    const matchData = {
      gameMode,
      gameId: selectedGame,
      gameName: selectedGameData?.name,
      entryFee: customEntryFee ? parseInt(customEntryFee) : entryFee,
      matchType,
      streamEnabled: true, // Always stream to FlockTube
    };

    onCreateMatch(matchData);
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    const game = games.find(g => g.id === gameId);
    if (game) {
      setEntryFee(game.entryFee);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {gameMode === 'console_stream' ? (
              <>
                <Gamepad2 className="w-6 h-6 text-primary" />
                <span>Create Console Stream Match</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 text-blue-600" />
                <span>Create Cloud Gaming Match</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Mode Info */}
          <Card className={gameMode === 'console_stream' ? 'border-primary/20 bg-primary/5' : 'border-blue-500/20 bg-blue-500/5'}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${gameMode === 'console_stream' ? 'bg-primary/20' : 'bg-blue-500/20'}`}>
                  {gameMode === 'console_stream' ? (
                    <Gamepad2 className={`w-5 h-5 ${gameMode === 'console_stream' ? 'text-primary' : 'text-blue-600'}`} />
                  ) : (
                    <Zap className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {gameMode === 'console_stream' ? 'Console Stream 1v1' : 'Cloud Gaming 1v1'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {gameMode === 'console_stream' 
                      ? 'Use your own console/PC, stream through FlockTube'
                      : 'Play in browser, stream automatically via FlockTube'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Game</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {games.map((game) => (
                <Card 
                  key={game.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedGame === game.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{game.name}</h4>
                        <p className="text-sm text-muted-foreground">{game.category}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        {game.entryFee} FC
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Match Settings */}
          {selectedGame && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Match Settings</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entry Fee */}
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee (FC)</Label>
                  <div className="flex space-x-2">
                    <Select value={entryFee.toString()} onValueChange={(value) => setEntryFee(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 FC</SelectItem>
                        <SelectItem value="2">2 FC</SelectItem>
                        <SelectItem value="3">3 FC</SelectItem>
                        <SelectItem value="5">5 FC</SelectItem>
                        <SelectItem value="10">10 FC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Custom"
                      value={customEntryFee}
                      onChange={(e) => setCustomEntryFee(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Match Type */}
                <div className="space-y-2">
                  <Label htmlFor="matchType">Match Type</Label>
                  <Select value={matchType} onValueChange={setMatchType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best_of_1">Best of 1</SelectItem>
                      <SelectItem value="best_of_3">Best of 3</SelectItem>
                      <SelectItem value="best_of_5">Best of 5</SelectItem>
                      <SelectItem value="first_to_3">First to 3</SelectItem>
                      <SelectItem value="first_to_5">First to 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* FlockTube Integration */}
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600">🎥 FlockTube Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    This match will be automatically streamed to FlockTube for maximum exposure
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Summary */}
          {selectedGame && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Match Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Game:</span>
                  <span className="font-semibold">{selectedGameData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Fee:</span>
                  <span className="font-semibold">
                    {customEntryFee ? `${customEntryFee} FC` : `${entryFee} FC`} per player
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pot:</span>
                  <span className="font-semibold text-green-600">
                    {customEntryFee ? `${parseInt(customEntryFee) * 2}` : `${entryFee * 2}`} FC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Rake (10%):</span>
                  <span className="font-semibold text-orange-600">
                    {customEntryFee ? `${Math.floor(parseInt(customEntryFee) * 2 * 0.1)}` : `${Math.floor(entryFee * 2 * 0.1)}`} FC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Winner Takes:</span>
                  <span className="font-semibold text-green-600">
                    {customEntryFee ? `${Math.floor(parseInt(customEntryFee) * 2 * 0.9)}` : `${Math.floor(entryFee * 2 * 0.9)}`} FC
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMatch}
              disabled={!selectedGame}
              className={`flex-1 ${
                gameMode === 'console_stream' 
                  ? 'bg-gradient-to-r from-primary to-primary/80' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700'
              }`}
            >
              {gameMode === 'console_stream' ? (
                <>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Create Console Match
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Cloud Match
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
