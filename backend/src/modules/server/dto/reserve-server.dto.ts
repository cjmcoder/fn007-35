import { IsString, IsOptional } from 'class-validator';

export class ReserveServerDto {
  @IsString()
  matchId!: string;
  
  @IsString()
  gameSlug!: string;     // maps to egg/docker image preset
  
  @IsString()
  region!: string;       // maps to node/locations in panel
  
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}





