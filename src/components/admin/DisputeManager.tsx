import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Gavel, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  FileText,
  User,
  Calendar,
  DollarSign,
  Target,
  Trophy,
  Flag,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Download,
  Send,
  Archive
} from 'lucide-react';

interface Dispute {
  id: string;
  disputeId: string;
  type: 'transaction' | 'match' | 'tournament' | 'payment' | 'refund' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  title: string;
  description: string;
  complainant: {
    id: string;
    username: string;
    email: string;
  };
  respondent: {
    id: string;
    username: string;
    email: string;
  };
  amount?: number;
  matchId?: string;
  tournamentId?: string;
  transactionId?: string;
  evidence: {
    id: string;
    type: 'image' | 'video' | 'text' | 'document';
    url: string;
    description: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];
  messages: {
    id: string;
    sender: string;
    senderType: 'complainant' | 'respondent' | 'admin';
    message: string;
    timestamp: string;
    attachments?: string[];
  }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedAdmin?: string;
  resolution?: string;
  resolutionType?: 'favor_complainant' | 'favor_respondent' | 'partial' | 'dismissed';
}

interface DisputeManagerProps {
  className?: string;
}

export const DisputeManager: React.FC<DisputeManagerProps> = ({ className = '' }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: '1',
      disputeId: 'DISP-2024-001',
      type: 'transaction',
      priority: 'high',
      status: 'investigating',
      title: 'Unauthorized withdrawal dispute',
      description: 'User claims they did not authorize a $500 withdrawal from their account',
      complainant: {
        id: 'user1',
        username: 'flocknodeadmin',
        email: 'flocknodeadmin@flocknode.com'
      },
      respondent: {
        id: 'system',
        username: 'system',
        email: 'system@flocknode.com'
      },
      amount: 500,
      transactionId: 'TXN-123456',
      evidence: [
        {
          id: '1',
          type: 'image',
          url: '/evidence/screenshot1.png',
          description: 'Screenshot of unauthorized transaction',
          uploadedBy: 'flocknodeadmin',
          uploadedAt: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: '1',
          sender: 'flocknodeadmin',
          senderType: 'complainant',
          message: 'I did not authorize this withdrawal. Please investigate.',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          sender: 'admin1',
          senderType: 'admin',
          message: 'We are investigating this transaction. Please provide any additional evidence.',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedAdmin: 'admin1'
    },
    {
      id: '2',
      disputeId: 'DISP-2024-002',
      type: 'match',
      priority: 'medium',
      status: 'open',
      title: 'Match result dispute',
      description: 'Player disputes the outcome of a tournament match claiming cheating',
      complainant: {
        id: 'user2',
        username: 'demo_user',
        email: 'demo@flocknode.com'
      },
      respondent: {
        id: 'user3',
        username: 'player_xyz',
        email: 'player@example.com'
      },
      matchId: 'MATCH-789',
      tournamentId: 'TOUR-456',
      evidence: [
        {
          id: '2',
          type: 'video',
          url: '/evidence/match_recording.mp4',
          description: 'Recording of the disputed match',
          uploadedBy: 'demo_user',
          uploadedAt: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: '3',
          sender: 'demo_user',
          senderType: 'complainant',
          message: 'This player was clearly using cheats. The video shows obvious aimbot behavior.',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  const { toast } = useToast();

  const handleDisputeAction = (disputeId: string, action: string, data?: any) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;

    let updatedDispute = { ...dispute };
    let message = '';

    switch (action) {
      case 'assign':
        updatedDispute.assignedAdmin = data.admin;
        updatedDispute.status = 'investigating';
        message = 'Dispute assigned successfully';
        break;
      case 'escalate':
        updatedDispute.priority = 'urgent';
        updatedDispute.status = 'escalated';
        message = 'Dispute escalated to urgent priority';
        break;
      case 'resolve':
        updatedDispute.status = 'resolved';
        updatedDispute.resolvedAt = new Date().toISOString();
        updatedDispute.resolution = data.resolution;
        updatedDispute.resolutionType = data.resolutionType;
        message = 'Dispute resolved successfully';
        break;
      case 'close':
        updatedDispute.status = 'closed';
        message = 'Dispute closed';
        break;
      case 'add_message':
        const newMsg = {
          id: Date.now().toString(),
          sender: 'admin1', // Current admin
          senderType: 'admin' as const,
          message: newMessage,
          timestamp: new Date().toISOString()
        };
        updatedDispute.messages = [...updatedDispute.messages, newMsg];
        setNewMessage('');
        message = 'Message added to dispute';
        break;
    }

    updatedDispute.updatedAt = new Date().toISOString();

    setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
    setSelectedDispute(updatedDispute);

    toast({
      title: "Dispute Updated",
      description: message,
    });
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle },
      urgent: { color: 'bg-red-100 text-red-800 border-red-300', icon: Flag }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock },
      investigating: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Search },
      resolved: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Archive },
      escalated: { color: 'bg-red-100 text-red-800 border-red-300', icon: Flag }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      transaction: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: DollarSign },
      match: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Target },
      tournament: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Trophy },
      payment: { color: 'bg-green-100 text-green-800 border-green-300', icon: DollarSign },
      refund: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: DollarSign },
      other: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: FileText }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = (dispute.disputeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dispute.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dispute.complainant?.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || dispute.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const totalStats = {
    totalDisputes: disputes.length,
    openDisputes: disputes.filter(d => d.status === 'open').length,
    investigatingDisputes: disputes.filter(d => d.status === 'investigating').length,
    resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
    urgentDisputes: disputes.filter(d => d.priority === 'urgent').length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-glow">
            <Gavel className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Dispute Manager</h2>
            <p className="text-muted-foreground">Manage user disputes and resolutions</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLoading(true)} className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-primary hover:shadow-glow text-background">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Disputes</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.openDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Investigating</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.investigatingDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-secondary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.resolvedDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flag className="w-8 h-8 text-destructive" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.urgentDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disputes List */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">Disputes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search disputes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredDisputes.map((dispute) => (
                <div 
                  key={dispute.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedDispute?.id === dispute.id 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-primary/20 glass-card hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{dispute.disputeId}</h3>
                      <div className="flex space-x-1">
                        {getPriorityBadge(dispute.priority)}
                        {getStatusBadge(dispute.status)}
                        {getTypeBadge(dispute.type)}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium text-foreground mb-1">{dispute.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{dispute.description}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Complainant: @{dispute.complainant.username}</span>
                    <span>Created: {formatDate(dispute.createdAt)}</span>
                  </div>

                  {dispute.amount && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-foreground">Amount: {formatCurrency(dispute.amount)}</span>
                    </div>
                  )}
                </div>
              ))}

              {filteredDisputes.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Disputes Found</h3>
                  <p className="text-muted-foreground">No disputes match your current filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispute Details */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="gradient-text">Dispute Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDispute ? (
              <div className="space-y-6">
                {/* Dispute Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{selectedDispute.disputeId}</h3>
                    <div className="flex space-x-2">
                      {getPriorityBadge(selectedDispute.priority)}
                      {getStatusBadge(selectedDispute.status)}
                      {getTypeBadge(selectedDispute.type)}
                    </div>
                  </div>

                  <h4 className="font-medium text-foreground mb-2">{selectedDispute.title}</h4>
                  <p className="text-muted-foreground mb-4">{selectedDispute.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Complainant</p>
                      <p className="font-medium text-foreground">@{selectedDispute.complainant.username}</p>
                      <p className="text-sm text-muted-foreground">{selectedDispute.complainant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Respondent</p>
                      <p className="font-medium text-foreground">@{selectedDispute.respondent.username}</p>
                      <p className="text-sm text-muted-foreground">{selectedDispute.respondent.email}</p>
                    </div>
                  </div>

                  {selectedDispute.amount && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Disputed Amount</p>
                      <p className="text-lg font-semibold text-foreground">{formatCurrency(selectedDispute.amount)}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Created: {formatDate(selectedDispute.createdAt)}</span>
                    <span>Updated: {formatDate(selectedDispute.updatedAt)}</span>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Messages</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                    {selectedDispute.messages.map((message) => (
                      <div key={message.id} className="p-3 bg-card/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{message.sender}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleDisputeAction(selectedDispute.id, 'add_message')}
                      className="bg-gradient-primary hover:shadow-glow text-background"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Actions</h4>
                  
                  {selectedDispute.status === 'open' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDisputeAction(selectedDispute.id, 'assign', { admin: 'admin1' })}
                        className="bg-gradient-primary hover:shadow-glow text-background"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Assign to Me
                      </Button>
                      <Button 
                        onClick={() => handleDisputeAction(selectedDispute.id, 'escalate')}
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Escalate
                      </Button>
                    </div>
                  )}

                  {selectedDispute.status === 'investigating' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="resolution">Resolution</Label>
                        <Textarea
                          id="resolution"
                          placeholder="Enter resolution details..."
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDisputeAction(selectedDispute.id, 'resolve', { 
                            resolution: resolutionText, 
                            resolutionType: 'favor_complainant' 
                          })}
                          className="bg-gradient-primary hover:shadow-glow text-background"
                          disabled={!resolutionText.trim()}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                        <Button 
                          onClick={() => handleDisputeAction(selectedDispute.id, 'close')}
                          variant="outline"
                          className="border-secondary/30 text-secondary hover:bg-secondary/10"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Gavel className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Dispute</h3>
                <p className="text-muted-foreground">Choose a dispute from the list to view details and take action.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisputeManager;


