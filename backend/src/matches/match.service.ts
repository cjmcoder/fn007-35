import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

export interface Match {
  id: string;
  hostId: string;
  opponentId?: string;
  game: string;
  matchType: '1v1' | 'tournament' | 'prop';
  entryFee: number;
  totalPrize: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  winnerId?: string;
  gameData?: any;
}

export interface CreateMatchDto {
  game: string;
  matchType: '1v1' | 'tournament' | 'prop';
  entryFee: number;
  gameData?: any;
}

export interface JoinMatchDto {
  matchId: string;
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  private matches: Map<string, Match> = new Map();
  private userMatches: Map<string, string[]> = new Map();

  constructor(private readonly feeCalculator: FeeCalculatorService) {}

  /**
   * Create a new match with fee calculation
   */
  async createMatch(userId: string, createMatchDto: CreateMatchDto): Promise<Match> {
    const { game, matchType, entryFee, gameData } = createMatchDto;

    // Validate entry fee
    if (entryFee <= 0) {
      throw new BadRequestException('Entry fee must be greater than 0');
    }

    // Calculate match fees (10% of entry fee)
    const matchFees = this.feeCalculator.calculateMatchFees(entryFee);
    
    // Total prize pool (both players pay entry fee, minus fees)
    const totalPrize = matchFees.netAmount * 2; // 2 players

    const match: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hostId: userId,
      game,
      matchType,
      entryFee,
      totalPrize,
      status: 'waiting',
      createdAt: new Date(),
      gameData,
    };

    this.matches.set(match.id, match);
    
    // Track user's matches
    if (!this.userMatches.has(userId)) {
      this.userMatches.set(userId, []);
    }
    this.userMatches.get(userId)!.push(match.id);

    this.logger.log(`Match created: ${match.id} by user ${userId} with ${entryFee} FC entry fee`);

    return match;
  }

  /**
   * Join an existing match
   */
  async joinMatch(userId: string, joinMatchDto: JoinMatchDto): Promise<Match> {
    const { matchId } = joinMatchDto;
    
    const match = this.matches.get(matchId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== 'waiting') {
      throw new BadRequestException('Match is not available for joining');
    }

    if (match.hostId === userId) {
      throw new BadRequestException('Cannot join your own match');
    }

    if (match.opponentId) {
      throw new BadRequestException('Match is already full');
    }

    // Update match with opponent
    match.opponentId = userId;
    match.status = 'active';
    match.startedAt = new Date();

    // Track user's matches
    if (!this.userMatches.has(userId)) {
      this.userMatches.set(userId, []);
    }
    this.userMatches.get(userId)!.push(match.id);

    this.logger.log(`User ${userId} joined match ${matchId}`);

    return match;
  }

  /**
   * Get match by ID
   */
  async getMatch(matchId: string): Promise<Match> {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    return match;
  }

  /**
   * Get all available matches
   */
  async getAvailableMatches(): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.status === 'waiting')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get user's matches
   */
  async getUserMatches(userId: string): Promise<Match[]> {
    const matchIds = this.userMatches.get(userId) || [];
    return matchIds
      .map(id => this.matches.get(id))
      .filter(match => match !== undefined) as Match[];
  }

  /**
   * Complete a match and determine winner
   */
  async completeMatch(matchId: string, winnerId: string, gameData?: any): Promise<Match> {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== 'active') {
      throw new BadRequestException('Match is not active');
    }

    if (winnerId !== match.hostId && winnerId !== match.opponentId) {
      throw new BadRequestException('Winner must be one of the match participants');
    }

    // Update match
    match.status = 'completed';
    match.winnerId = winnerId;
    match.completedAt = new Date();
    match.gameData = { ...match.gameData, ...gameData };

    this.logger.log(`Match ${matchId} completed. Winner: ${winnerId}`);

    return match;
  }

  /**
   * Cancel a match
   */
  async cancelMatch(matchId: string, userId: string): Promise<Match> {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.hostId !== userId) {
      throw new BadRequestException('Only the host can cancel the match');
    }

    if (match.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed match');
    }

    match.status = 'cancelled';
    match.completedAt = new Date();

    this.logger.log(`Match ${matchId} cancelled by user ${userId}`);

    return match;
  }

  /**
   * Get match statistics
   */
  async getMatchStats(): Promise<{
    totalMatches: number;
    activeMatches: number;
    completedMatches: number;
    totalPrizePool: number;
    averageEntryFee: number;
  }> {
    const matches = Array.from(this.matches.values());
    
    return {
      totalMatches: matches.length,
      activeMatches: matches.filter(m => m.status === 'active').length,
      completedMatches: matches.filter(m => m.status === 'completed').length,
      totalPrizePool: matches.reduce((sum, m) => sum + m.totalPrize, 0),
      averageEntryFee: matches.length > 0 
        ? matches.reduce((sum, m) => sum + m.entryFee, 0) / matches.length 
        : 0,
    };
  }

  /**
   * Calculate match fees for display
   */
  calculateMatchFees(entryFee: number) {
    return this.feeCalculator.calculateMatchFees(entryFee);
  }
}





