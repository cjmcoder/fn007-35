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
  Eye, 
  Edit, 
  Trash2, 
  Target,
  DollarSign,
  Clock,
  Users,
  Gamepad2,
  Calendar,
  Star,
  AlertCircle
} from 'lucide-react';

interface Prop {
  id: string;
  title: string;
  description: string;
  game: string;
  category: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  duration: number; // in hours
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  participants: number;
  tags: string[];
}

interface PropBuilderProps {
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
  'Battle Royale',
  'FPS',
  'Sports',
  'Racing',
  'Fighting',
  'Strategy',
  'MOBA',
  'RPG',
  'Puzzle',
  'Other'
];

export const PropBuilder: React.FC<PropBuilderProps> = ({ className = '' }) => {
  const [props, setProps] = useState<Prop[]>([
    {
      id: '1',
      title: 'Warzone Victory Royale',
      description: 'First to win a Battle Royale match in Warzone',
      game: 'Call of Duty: Warzone',
      category: 'Battle Royale',
      entryFee: 10,
      prizePool: 50,
      maxParticipants: 10,
      duration: 2,
      isActive: true,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      participants: 7,
      tags: ['battle-royale', 'warzone', 'victory']
    },
    {
      id: '2',
      title: 'Valorant Ace Challenge',
      description: 'Get an ace (5 kills in one round) in Valorant',
      game: 'Valorant',
      category: 'FPS',
      entryFee: 5,
      prizePool: 25,
      maxParticipants: 20,
      duration: 1,
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      participants: 12,
      tags: ['fps', 'valorant', 'ace']
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingProp, setEditingProp] = useState<Prop | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    category: '',
    entryFee: 0,
    prizePool: 0,
    maxParticipants: 10,
    duration: 1,
    isActive: true,
    isFeatured: false,
    tags: ''
  });

  const { toast } = useToast();

  const handleCreateProp = () => {
    setIsCreating(true);
    setEditingProp(null);
    setFormData({
      title: '',
      description: '',
      game: '',
      category: '',
      entryFee: 0,
      prizePool: 0,
      maxParticipants: 10,
      duration: 1,
      isActive: true,
      isFeatured: false,
      tags: ''
    });
  };

  const handleEditProp = (prop: Prop) => {
    setEditingProp(prop);
    setIsCreating(true);
    setFormData({
      title: prop.title,
      description: prop.description,
      game: prop.game,
      category: prop.category,
      entryFee: prop.entryFee,
      prizePool: prop.prizePool,
      maxParticipants: prop.maxParticipants,
      duration: prop.duration,
      isActive: prop.isActive,
      isFeatured: prop.isFeatured,
      tags: prop.tags.join(', ')
    });
  };

  const handleSaveProp = () => {
    if (!formData.title || !formData.description || !formData.game || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newProp: Prop = {
      id: editingProp ? editingProp.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      game: formData.game,
      category: formData.category,
      entryFee: formData.entryFee,
      prizePool: formData.prizePool,
      maxParticipants: formData.maxParticipants,
      duration: formData.duration,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      createdAt: editingProp ? editingProp.createdAt : new Date().toISOString(),
      participants: editingProp ? editingProp.participants : 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (editingProp) {
      setProps(prev => prev.map(p => p.id === editingProp.id ? newProp : p));
      toast({
        title: "Prop Updated",
        description: "Prop has been successfully updated.",
      });
    } else {
      setProps(prev => [newProp, ...prev]);
      toast({
        title: "Prop Created",
        description: "New prop has been successfully created.",
      });
    }

    setIsCreating(false);
    setEditingProp(null);
  };

  const handleDeleteProp = (propId: string) => {
    setProps(prev => prev.filter(p => p.id !== propId));
    toast({
      title: "Prop Deleted",
      description: "Prop has been successfully deleted.",
    });
  };

  const handleToggleActive = (propId: string) => {
    setProps(prev => prev.map(p => 
      p.id === propId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Target className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Prop Builder</h2>
            <p className="text-muted-foreground">Create and manage betting props for users</p>
          </div>
        </div>
        <Button onClick={handleCreateProp} className="bg-gradient-primary hover:shadow-glow text-background">
          <Plus className="w-4 h-4 mr-2" />
          Create New Prop
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">
              {editingProp ? 'Edit Prop' : 'Create New Prop'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Prop Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Warzone Victory Royale"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what users need to achieve..."
                    rows={3}
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
                    placeholder="battle-royale, warzone, victory"
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
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-primary/30 text-primary hover:bg-primary/10">
                Cancel
              </Button>
              <Button onClick={handleSaveProp} className="bg-gradient-primary hover:shadow-glow text-background">
                <Save className="w-4 h-4 mr-2" />
                {editingProp ? 'Update Prop' : 'Create Prop'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Props List */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="gradient-text">Active Props ({props.filter(p => p.isActive).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {props.map((prop) => (
              <div key={prop.id} className="border border-primary/20 rounded-lg p-4 glass-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{prop.title}</h3>
                      <div className="flex space-x-2">
                        {prop.isFeatured && <Badge className="bg-accent/20 text-accent border-accent/30">Featured</Badge>}
                        <Badge className={prop.isActive ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                          {prop.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3">{prop.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{prop.game}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">${prop.entryFee} entry</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">{prop.participants}/{prop.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{prop.duration}h</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Prize Pool: ${prop.prizePool}</span>
                      <span>Created: {formatDate(prop.createdAt)}</span>
                      {prop.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {prop.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-primary/30 text-primary">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditProp(prop)} className="border-primary/30 text-primary hover:bg-primary/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleActive(prop.id)}
                      className="border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      {prop.isActive ? <AlertCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteProp(prop.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {props.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Props Created</h3>
                <p className="text-muted-foreground">Create your first prop to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropBuilder;
