import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MatchState {
  PENDING = 'PENDING',
  READY_CHECK = 'READY_CHECK',
  READY = 'READY',
  COUNTDOWN = 'COUNTDOWN',
  ACTIVE = 'ACTIVE',
  COMPLETE = 'COMPLETE',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum Platform {
  PS5 = 'PS5',
  XBOX_SERIES_X = 'XBOX_SERIES_X',
  PC = 'PC',
  SWITCH = 'SWITCH',
  MOBILE = 'MOBILE',
}

export enum BestOf {
  ONE = 1,
  THREE = 3,
  FIVE = 5,
}

export enum MatchResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

export class CreateMatchDto {
  @ApiProperty({ description: 'Game ID' })
  @IsString()
  gameId: string;

  @ApiProperty({ description: 'Gaming platform', enum: Platform })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ description: 'Entry fee in FC', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  entryFc: number;

  @ApiProperty({ description: 'Ruleset ID (optional)' })
  @IsString()
  @IsOptional()
  rulesetId?: string;

  @ApiProperty({ description: 'Best of format', enum: BestOf, default: 1 })
  @IsEnum(BestOf)
  @IsOptional()
  bestOf?: BestOf = 1;

  @ApiProperty({ description: 'Region', default: 'NA-East' })
  @IsString()
  @IsOptional()
  region?: string = 'NA-East';

  @ApiProperty({ description: 'Require stream verification', default: false })
  @IsBoolean()
  @IsOptional()
  requireStream?: boolean = false;
}

export class CreateMatchResponseDto {
  @ApiProperty({ description: 'Match ID' })
  matchId: string;

  @ApiProperty({ description: 'Match state', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Entry fee locked' })
  escrowLocked: boolean;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class JoinMatchDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;
}

export class JoinMatchResponseDto {
  @ApiProperty({ description: 'Match state after joining', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class ReadyMatchDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;
}

export class ReadyMatchResponseDto {
  @ApiProperty({ description: 'Match state after ready', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class StartMatchDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;
}

export class StartMatchResponseDto {
  @ApiProperty({ description: 'Match state after start', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Match start timestamp' })
  startAt: Date;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class ForfeitMatchDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;
}

export class ForfeitMatchResponseDto {
  @ApiProperty({ description: 'Match state after forfeit', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Winner ID' })
  winnerId: string;

  @ApiProperty({ description: 'Forfeit reason' })
  reason: string;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class ReportResultDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;

  @ApiProperty({ description: 'Match result', enum: MatchResult })
  @IsEnum(MatchResult)
  result: MatchResult;

  @ApiProperty({ description: 'Score (optional)', required: false })
  @IsOptional()
  score?: {
    me: number;
    opponent: number;
  };
}

export class ReportResultResponseDto {
  @ApiProperty({ description: 'Match state after report', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class DisputeMatchDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;

  @ApiProperty({ description: 'Dispute reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class DisputeMatchResponseDto {
  @ApiProperty({ description: 'Match state after dispute', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Dispute ID' })
  disputeId: string;

  @ApiProperty({ description: 'Match details' })
  match: MatchDto;
}

export class UploadProofDto {
  @ApiProperty({ description: 'Match ID' })
  @IsString()
  matchId: string;

  @ApiProperty({ description: 'Proof type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'File key' })
  @IsString()
  fileKey: string;
}

export class UploadProofResponseDto {
  @ApiProperty({ description: 'Proof ID' })
  proofId: string;

  @ApiProperty({ description: 'Upload status' })
  status: string;
}

export class MatchDto {
  @ApiProperty({ description: 'Match ID' })
  id: string;

  @ApiProperty({ description: 'Host user ID' })
  hostId: string;

  @ApiProperty({ description: 'Opponent user ID', required: false })
  oppId?: string;

  @ApiProperty({ description: 'Match state', enum: MatchState })
  state: MatchState;

  @ApiProperty({ description: 'Game ID' })
  gameId: string;

  @ApiProperty({ description: 'Gaming platform', enum: Platform })
  platform: Platform;

  @ApiProperty({ description: 'Entry fee in FC' })
  entryFc: number;

  @ApiProperty({ description: 'Ruleset ID', required: false })
  rulesetId?: string;

  @ApiProperty({ description: 'Best of format' })
  bestOf: number;

  @ApiProperty({ description: 'Region' })
  region: string;

  @ApiProperty({ description: 'Require stream verification' })
  requireStream: boolean;

  @ApiProperty({ description: 'Match start timestamp', required: false })
  startAt?: Date;

  @ApiProperty({ description: 'Match completion timestamp', required: false })
  completeAt?: Date;

  @ApiProperty({ description: 'Winner user ID', required: false })
  winnerId?: string;

  @ApiProperty({ description: 'Host score' })
  hostScore: number;

  @ApiProperty({ description: 'Opponent score' })
  oppScore: number;

  @ApiProperty({ description: 'Match creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Match update timestamp' })
  updatedAt: Date;
}

export class MatchListDto {
  @ApiProperty({ description: 'Pagination cursor' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiProperty({ description: 'Filter by game ID', required: false })
  @IsString()
  @IsOptional()
  gameId?: string;

  @ApiProperty({ description: 'Filter by platform', enum: Platform, required: false })
  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @ApiProperty({ description: 'Filter by region', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ description: 'Filter by match state', enum: MatchState, required: false })
  @IsEnum(MatchState)
  @IsOptional()
  state?: MatchState;
}

export class MatchListResponseDto {
  @ApiProperty({ description: 'List of matches' })
  matches: MatchDto[];

  @ApiProperty({ description: 'Next page cursor' })
  nextCursor?: string;

  @ApiProperty({ description: 'Has more items' })
  hasMore: boolean;
}

export class MatchStatsDto {
  @ApiProperty({ description: 'Total matches played' })
  totalMatches: number;

  @ApiProperty({ description: 'Matches won' })
  matchesWon: number;

  @ApiProperty({ description: 'Matches lost' })
  matchesLost: number;

  @ApiProperty({ description: 'Win rate percentage' })
  winRate: number;

  @ApiProperty({ description: 'Total FC wagered' })
  totalWagered: number;

  @ApiProperty({ description: 'Total FC won' })
  totalWon: number;

  @ApiProperty({ description: 'Total FC lost' })
  totalLost: number;

  @ApiProperty({ description: 'Net FC gain/loss' })
  netGain: number;
}





