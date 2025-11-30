import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  Trophy,
  Edit, 
  Trash2, 
  Target,
  DollarSign,
  Clock,
  Users,
  Gamepad2,
  Calendar,
  Star,
  AlertCircle,
  Award,
  Zap
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  game: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  duration: number; // in hours
  isActive: boolean;
  isFeatured: boolean;
  isRecurring: boolean;
  recurrenceType?: 'Daily' | 'Weekly' | 'Monthly';
  createdAt: string;
  participants: number;
  completionRate: number;
  tags: string[];
  objectives: string[];
}

interface ChallengeBuilderProps {
  className?: string;
}

const GAMES = [
  'Call of Duty: Warzone',
  'Fortnite',
  'Apex Legends',
  'Valorant',
  'CS2',
  'Rocket League',
  'FIFA 24',
  'Madden NFL 24',
  'NBA 2K24',
  'Other'
];

const CATEGORIES = [
  'Elimination',
  'Survival',
  'Speed Run',
  'Accuracy',
  'Combo',
  'Endurance',
  'Team Play',
  'Creative',
  'Other'
];

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Hard', label: 'Hard', color: 'bg-orange-100 text-orange-800' },
  { value: 'Expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];

export const ChallengeBuilder: React.FC<ChallengeBuilderProps> = ({ className = '' }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Warzone Killstreak Master',
      description: 'Achieve a 10+ killstreak in a single Warzone match',
      game: 'Call of Duty: Warzone',
      category: 'Elimination',
      difficulty: 'Hard',
      entryFee: 15,
      prizePool: 100,
      maxParticipants: 25,
      duration: 3,
      isActive: true,
      isFeatured: true,
      isRecurring: false,
      createdAt: new Date().toISOString(),
      participants: 18,
      completionRate: 65,
      tags: ['killstreak', 'warzone', 'elimination'],
      objectives: [
        'Get 10+ kills in a single match',
        'Survive until top 10',
        'Win the match'
      ]
    },
    {
      id: '2',
      title: 'Valorant Perfect Aim',
      description: 'Achieve 80%+ headshot accuracy in a competitive match',
      game: 'Valorant',
      category: 'Accuracy',
      difficulty: 'Expert',
      entryFee: 20,
      prizePool: 150,
      maxParticipants: 15,
      duration: 2,
      isActive: true,
      isFeatured: false,
      isRecurring: true,
      recurrenceType: 'Daily',
      createdAt: new Date().toISOString(),
      participants: 8,
      completionRate: 25,
      tags: ['accuracy', 'valorant', 'headshots'],
      objectives: [
        'Achieve 80%+ headshot accuracy',
        'Win the match',
        'Get at least 15 kills'
      ]
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    category: '',
    difficulty: 'Medium' as const,
    entryFee: 0,
    prizePool: 0,
    maxParticipants: 10,
    duration: 1,
    isActive: true,
    isFeatured: false,
    isRecurring: false,
    recurrenceType: 'Daily' as const,
    tags: '',
    objectives: ''
  });

  const { toast } = useToast();

  const handleCreateChallenge = () => {
    setIsCreating(true);
    setEditingChallenge(null);
    setFormData({
      title: '',
      description: '',
      game: '',
      category: '',
      difficulty: 'Medium',
      entryFee: 0,
      prizePool: 0,
      maxParticipants: 10,
      duration: 1,
      isActive: true,
      isFeatured: false,
      isRecurring: false,
      recurrenceType: 'Daily',
      tags: '',
      objectives: ''
    });
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsCreating(true);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      game: challenge.game,
      category: challenge.category,
      difficulty: challenge.difficulty,
      entryFee: challenge.entryFee,
      prizePool: challenge.prizePool,
      maxParticipants: challenge.maxParticipants,
      duration: challenge.duration,
      isActive: challenge.isActive,
      isFeatured: challenge.isFeatured,
      isRecurring: challenge.isRecurring,
      recurrenceType: challenge.recurrenceType || 'Daily',
      tags: challenge.tags.join(', '),
      objectives: challenge.objectives.join('\n')
    });
  };

  const handleSaveChallenge = () => {
    if (!formData.title || !formData.description || !formData.game || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newChallenge: Challenge = {
      id: editingChallenge ? editingChallenge.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      game: formData.game,
      category: formData.category,
      difficulty: formData.difficulty,
      entryFee: formData.entryFee,
      prizePool: formData.prizePool,
      maxParticipants: formData.maxParticipants,
      duration: formData.duration,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isRecurring: formData.isRecurring,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : undefined,
      createdAt: editingChallenge ? editingChallenge.createdAt : new Date().toISOString(),
      participants: editingChallenge ? editingChallenge.participants : 0,
      completionRate: editingChallenge ? editingChallenge.completionRate : 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      objectives: formData.objectives.split('\n').map(obj => obj.trim()).filter(obj => obj)
    };

    if (editingChallenge) {
      setChallenges(prev => prev.map(c => c.id === editingChallenge.id ? newChallenge : c));
      toast({
        title: "Challenge Updated",
        description: "Challenge has been successfully updated.",
      });
    } else {
      setChallenges(prev => [newChallenge, ...prev]);
      toast({
        title: "Challenge Created",
        description: "New challenge has been successfully created.",
      });
    }

    setIsCreating(false);
    setEditingChallenge(null);
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
    toast({
      title: "Challenge Deleted",
      description: "Challenge has been successfully deleted.",
    });
  };

  const handleToggleActive = (challengeId: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = DIFFICULTIES.find(d => d.value === difficulty);
    return diff ? diff.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-glow">
            <Trophy className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Challenge Builder</h2>
            <p className="text-muted-foreground">Create and manage competitive challenges for users</p>
          </div>
        </div>
        <Button onClick={handleCreateChallenge} className="bg-gradient-secondary hover:shadow-glow text-background">
          <Plus className="w-4 h-4 mr-2" />
          Create New Challenge
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">
              {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Challenge Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Warzone Killstreak Master"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the challenge objectives..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Objectives (one per line)</Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                    placeholder="Get 10+ kills in a single match&#10;Survive until top 10&#10;Win the match"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game">Game *</Label>
                    <Select value={formData.game} onValueChange={(value) => setFormData(prev => ({ ...prev, game: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game" />
                      </SelectTrigger>
                      <SelectContent>
                        {GAMES.map(game => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, entryFee: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prizePool">Prize Pool ($)</Label>
                    <Input
                      id="prizePool"
                      type="number"
                      value={formData.prizePool}
                      onChange={(e) => setFormData(prev => ({ ...prev, prizePool: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="killstreak, warzone, elimination"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                    />
                    <Label htmlFor="isRecurring">Recurring</Label>
                  </div>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceType">Recurrence Type</Label>
                    <Select value={formData.recurrenceType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurrenceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-primary/30 text-primary hover:bg-primary/10">
                Cancel
              </Button>
              <Button onClick={handleSaveChallenge} className="bg-gradient-secondary hover:shadow-glow text-background">
                <Save className="w-4 h-4 mr-2" />
                {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges List */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="gradient-text">Active Challenges ({challenges.filter(c => c.isActive).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border border-primary/20 rounded-lg p-4 glass-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
                      <div className="flex space-x-2">
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        {challenge.isFeatured && <Badge className="bg-accent/20 text-accent border-accent/30">Featured</Badge>}
                        {challenge.isRecurring && <Badge className="bg-secondary/20 text-secondary border-secondary/30">Recurring</Badge>}
                        <Badge className={challenge.isActive ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                          {challenge.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3">{challenge.description}</p>

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-foreground mb-2">Objectives:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {challenge.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{challenge.game}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">${challenge.entryFee} entry</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">{challenge.participants}/{challenge.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{challenge.duration}h</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">{challenge.completionRate}% completion</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Prize Pool: ${challenge.prizePool}</span>
                      <span>Created: {formatDate(challenge.createdAt)}</span>
                      {challenge.isRecurring && challenge.recurrenceType && (
                        <span>Recurs: {challenge.recurrenceType}</span>
                      )}
                      {challenge.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {challenge.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-primary/30 text-primary">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditChallenge(challenge)} className="border-primary/30 text-primary hover:bg-primary/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleActive(challenge.id)}
                      className="border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      {challenge.isActive ? <AlertCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteChallenge(challenge.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {challenges.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Challenges Created</h3>
                <p className="text-muted-foreground">Create your first challenge to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeBuilder;
