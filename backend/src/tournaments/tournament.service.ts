import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

export interface Tournament {
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
  brackets: TournamentBracket[];
  createdAt: Date;
  startsAt: Date;
  completedAt?: Date;
  winnerId?: string;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  seed: number;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  joinedAt: Date;
  eliminatedAt?: Date;
}

export interface TournamentBracket {
  id: string;
  round: number;
  matches: TournamentMatch[];
  isComplete: boolean;
}

export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  player1Score?: number;
  player2Score?: number;
  status: 'pending' | 'active' | 'completed';
  winnerId?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateTournamentDto {
  title: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin';
  maxParticipants: number;
  entryFee: number;
  startsAt: string; // ISO date string
}

export interface JoinTournamentDto {
  tournamentId: string;
}

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);
  private tournaments: Map<string, Tournament> = new Map();
  private userTournaments: Map<string, string[]> = new Map();

  constructor(private readonly feeCalculator: FeeCalculatorService) {}

  /**
   * Create a new tournament
   */
  async createTournament(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const { title, description, game, format, maxParticipants, entryFee, startsAt } = createTournamentDto;

    if (maxParticipants < 2 || maxParticipants > 64) {
      throw new BadRequestException('Tournament must have between 2 and 64 participants');
    }

    if (entryFee < 0) {
      throw new BadRequestException('Entry fee cannot be negative');
    }

    // Calculate total prize pool (after 10% fee)
    const feeCalculation = this.feeCalculator.calculateMatchFees(entryFee * maxParticipants);
    const totalPrizePool = feeCalculation.netAmount;

    const tournament: Tournament = {
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      game,
      format,
      maxParticipants,
      entryFee,
      totalPrizePool,
      status: 'upcoming',
      participants: [],
      brackets: [],
      createdAt: new Date(),
      startsAt: new Date(startsAt),
    };

    this.tournaments.set(tournament.id, tournament);
    this.logger.log(`Tournament created: ${tournament.id} - ${title}`);

    return tournament;
  }

  /**
   * Get all tournaments
   */
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get tournament by ID
   */
  async getTournament(tournamentId: string): Promise<Tournament> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  /**
   * Join a tournament
   */
  async joinTournament(userId: string, joinTournamentDto: JoinTournamentDto): Promise<Tournament> {
    const { tournamentId } = joinTournamentDto;
    
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
      throw new BadRequestException('Tournament is not accepting registrations');
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    // Check if user is already registered
    const existingParticipant = tournament.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      throw new BadRequestException('User is already registered for this tournament');
    }

    // Add participant
    const participant: TournamentParticipant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username: `user_${userId}`, // In real app, fetch from user service
      avatarUrl: '/placeholder.svg',
      seed: tournament.participants.length + 1,
      status: 'registered',
      joinedAt: new Date(),
    };

    tournament.participants.push(participant);

    // Track user's tournaments
    if (!this.userTournaments.has(userId)) {
      this.userTournaments.set(userId, []);
    }
    this.userTournaments.get(userId)!.push(tournamentId);

    // Update tournament status
    if (tournament.participants.length >= tournament.maxParticipants) {
      tournament.status = 'registration';
    }

    this.logger.log(`User ${userId} joined tournament ${tournamentId}`);

    return tournament;
  }

  /**
   * Start a tournament (generate brackets)
   */
  async startTournament(tournamentId: string): Promise<Tournament> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== 'registration') {
      throw new BadRequestException('Tournament cannot be started');
    }

    if (tournament.participants.length < 2) {
      throw new BadRequestException('Tournament needs at least 2 participants');
    }

    // Generate brackets based on format
    tournament.brackets = this.generateBrackets(tournament);
    tournament.status = 'active';

    this.logger.log(`Tournament started: ${tournamentId}`);

    return tournament;
  }

  /**
   * Generate tournament brackets
   */
  private generateBrackets(tournament: Tournament): TournamentBracket[] {
    const brackets: TournamentBracket[] = [];
    const participants = tournament.participants;
    const participantCount = participants.length;

    if (tournament.format === 'single-elimination') {
      return this.generateSingleEliminationBrackets(participants);
    } else if (tournament.format === 'double-elimination') {
      return this.generateDoubleEliminationBrackets(participants);
    } else if (tournament.format === 'round-robin') {
      return this.generateRoundRobinBrackets(participants);
    }

    return brackets;
  }

  /**
   * Generate single elimination brackets
   */
  private generateSingleEliminationBrackets(participants: TournamentParticipant[]): TournamentBracket[] {
    const brackets: TournamentBracket[] = [];
    let currentRound = 1;
    let currentParticipants = [...participants];
    
    while (currentParticipants.length > 1) {
      const matches: TournamentMatch[] = [];
      const nextRoundParticipants: TournamentParticipant[] = [];
      
      for (let i = 0; i < currentParticipants.length; i += 2) {
        const match: TournamentMatch = {
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          round: currentRound,
          matchNumber: Math.floor(i / 2) + 1,
          player1Id: currentParticipants[i]?.userId,
          player2Id: currentParticipants[i + 1]?.userId,
          status: 'pending',
        };
        
        matches.push(match);
      }
      
      brackets.push({
        id: `bracket_${currentRound}`,
        round: currentRound,
        matches,
        isComplete: false,
      });
      
      currentRound++;
      currentParticipants = nextRoundParticipants;
    }
    
    return brackets;
  }

  /**
   * Generate double elimination brackets
   */
  private generateDoubleEliminationBrackets(participants: TournamentParticipant[]): TournamentBracket[] {
    // Simplified double elimination - in real app, this would be more complex
    return this.generateSingleEliminationBrackets(participants);
  }

  /**
   * Generate round robin brackets
   */
  private generateRoundRobinBrackets(participants: TournamentParticipant[]): TournamentBracket[] {
    const brackets: TournamentBracket[] = [];
    const matches: TournamentMatch[] = [];
    
    // Generate all possible matchups
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match: TournamentMatch = {
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          round: 1,
          matchNumber: matches.length + 1,
          player1Id: participants[i].userId,
          player2Id: participants[j].userId,
          status: 'pending',
        };
        
        matches.push(match);
      }
    }
    
    brackets.push({
      id: 'bracket_1',
      round: 1,
      matches,
      isComplete: false,
    });
    
    return brackets;
  }

  /**
   * Get user's tournaments
   */
  async getUserTournaments(userId: string): Promise<Tournament[]> {
    const tournamentIds = this.userTournaments.get(userId) || [];
    return tournamentIds
      .map(id => this.tournaments.get(id))
      .filter(tournament => tournament !== undefined) as Tournament[];
  }

  /**
   * Get tournament statistics
   */
  async getTournamentStats(): Promise<{
    totalTournaments: number;
    activeTournaments: number;
    completedTournaments: number;
    totalParticipants: number;
    totalPrizePool: number;
    averageEntryFee: number;
  }> {
    const tournaments = Array.from(this.tournaments.values());
    
    return {
      totalTournaments: tournaments.length,
      activeTournaments: tournaments.filter(t => t.status === 'active').length,
      completedTournaments: tournaments.filter(t => t.status === 'completed').length,
      totalParticipants: tournaments.reduce((sum, t) => sum + t.participants.length, 0),
      totalPrizePool: tournaments.reduce((sum, t) => sum + t.totalPrizePool, 0),
      averageEntryFee: tournaments.length > 0 
        ? tournaments.reduce((sum, t) => sum + t.entryFee, 0) / tournaments.length 
        : 0,
    };
  }

  /**
   * Calculate tournament entry fee
   */
  calculateTournamentFee(entryFee: number, participantCount: number) {
    const totalEntryFees = entryFee * participantCount;
    return this.feeCalculator.calculateMatchFees(totalEntryFees);
  }
}
