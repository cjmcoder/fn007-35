import { IsString, IsNumber, IsObject, IsEnum, IsOptional } from 'class-validator';

export enum OverlayEventType {
  SCORE = 'SCORE',
  STATE = 'STATE',
  MATCH_END = 'MATCH_END',
  HEARTBEAT = 'HEARTBEAT',
}

export class OverlayEventDto {
  @IsString()
  eventId!: string;              // uuidv7
  
  @IsString()
  matchId!: string;
  
  @IsEnum(OverlayEventType)
  type!: OverlayEventType;
  
  @IsObject()
  payload!: any;                 // type-specific payload
  
  @IsNumber()
  timestamp!: number;            // unix ms timestamp
}

export class ScorePayloadDto {
  @IsNumber()
  home!: number;
  
  @IsNumber()
  away!: number;
}

export class StatePayloadDto {
  @IsString()
  state!: string;                // e.g., 'PAUSE', 'RESUME', 'HALFTIME'
  
  @IsOptional()
  @IsString()
  message?: string;
}

export class MatchEndPayloadDto {
  @IsString()
  reason!: string;               // e.g., 'COMPLETED', 'FORFEIT', 'DISCONNECT'
  
  @IsOptional()
  @IsString()
  winner?: string;               // 'home' or 'away'
  
  @IsOptional()
  @IsObject()
  finalScore?: ScorePayloadDto;
}

export class HeartbeatPayloadDto {
  @IsString()
  status!: string;               // e.g., 'alive', 'ready'
  
  @IsOptional()
  @IsNumber()
  uptime?: number;               // seconds since start
}





