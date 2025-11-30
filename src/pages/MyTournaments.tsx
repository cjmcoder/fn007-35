import React from 'react';
import TournamentList from '@/components/tournaments/TournamentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trophy, Cloud, Target, Users } from 'lucide-react';

export default function MyTournamentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold gradient-text">FLOCKNODE Tournaments</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Professional cloud gaming tournaments with real prizes
          </p>
        </div>

        {/* Tournament Only Notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Tournament-Only Gaming:</strong> FLOCKNODE now focuses exclusively on professional tournament play. 
                All matches are conducted through our cloud gaming infrastructure for maximum fairness and security.
              </div>
              <Badge variant="secondary" className="ml-4">
                TOURNAMENT ONLY
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Cloud Gaming</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All tournaments run on our cloud gaming infrastructure. Zero downloads, instant play, 
                and impossible to cheat.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Skill-Based</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compete in skill-based challenges and tournaments. Your gaming skills determine your success.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Professional</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professional tournament structure with real prizes, rankings, and competitive integrity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tournament List */}
        <TournamentList />
      </div>
    </div>
  );
}